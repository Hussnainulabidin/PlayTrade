const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Orders = require("../models/order");
const Valorant = require("../models/valorant");
const User = require("../models/user");
const { createOrderChat } = require("../utils/chatUtils");
const Chat = require("../models/chatModel");
const mongoose = require("mongoose");
const walletActions = require("../models/wallet");
const sendEmail = require("../utils/email");

// Import all game models with error handling
let PUBG, Fortnite, LeagueOfLegends, BrawlStars, ClashOfClans;


try {
  Fortnite = require("../models/fortnite");
} catch (err) {
  console.warn("Fortnite model not found:", err.message);
}

try {
  LeagueOfLegends = require("../models/leagueoflegends");
} catch (err) {
  console.warn("League of Legends model not found:", err.message);
}

try {
  BrawlStars = require("../models/brawlstars");
} catch (err) {
  console.warn("Brawl Stars model not found:", err.message);
}

try {
  ClashOfClans = require("../models/clashofclans");
} catch (err) {
  console.warn("Clash of Clans model not found:", err.message);
}

// Commission rates by game type (in percentage)
const COMMISSION_RATES = {
  Valorant: 15,
  PUBG: 15,
  Fortnite: 15,
  "League of Legends": 15,
  "Brawl Stars": 15,
  "Clash of Clans": 15,
  Default: 15, // Default commission rate
};

// Get all orders for the currently logged-in user (client)
exports.getMyOrders = catchAsync(async (req, res, next) => {
  // Get current user ID
  const userId = req.user._id;

  // Find all orders where clientID matches the current user's ID
  const orders = await Orders.find({ clientID: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "accountID",
      select: "title gameType",
    });

  // Get unique seller IDs from orders
  const sellerIds = [...new Set(orders.map((order) => order.sellerID))];

  // Fetch all sellers in one query
  const sellers = await User.find({
    _id: { $in: sellerIds },
  }).select("_id username");

  // Create a map for quick lookup
  const sellerMap = {};
  sellers.forEach((seller) => {
    sellerMap[seller._id.toString()] = seller.username;
  });

  // Process each order to get game details
  const formattedOrdersPromises = orders.map(async (order) => {
    // Determine game type based on available data
    const gameType = order.game || (order.accountID && order.accountID.gameType) || "Valorant";

    // Get price from order schema
    const orderPrice = order.price || order.amount || 0;

    // Format creation date
    const creationDate = order.createdAt || new Date();

    // Get seller username from the map
    const sellerId = order.sellerID.toString();
    const sellerUsername = sellerMap[sellerId] || "Unknown Seller";

    // Get detailed game information based on game type
    let gameDetails = {
      title: order.accountID?.title || "Unknown Account",
      gameType: gameType
    };

    // If we have an accountID, try to get more game details
    if (order.accountID) {
      try {
        let gameModel;

        // Select the appropriate game model based on game type
        switch (gameType.toLowerCase()) {
          case "valorant":
            gameModel = Valorant;
            break;
          case "fortnite":
            gameModel = Fortnite;
            break;
          case "league of legends":
            gameModel = LeagueOfLegends;
            break;
          case "brawl stars":
            gameModel = BrawlStars;
            break;
          default:
            gameModel = Valorant; // Default to Valorant
        }

        // If we found a valid model, get additional details
        if (gameModel) {
          const gameAccount = await gameModel.findById(order.accountID);

          if (gameAccount) {
            gameDetails = {
              title: gameAccount.title || "Unknown Title",
              gameType: gameType,
              description: gameAccount.description || "",
              accountLevel: gameAccount.accountLevel || gameAccount.level || "",
              server: gameAccount.server || gameAccount.region || "",
              champions: gameAccount.champions || gameAccount.characters || gameAccount.skins || []
            };
          }
        }
      } catch (error) {
        console.error(`Error fetching game details for ${gameType}:`, error);
        // Continue with basic game details on error
      }
    }

    return {
      id: order._id,
      title: gameDetails.title,
      gameType: gameType,
      gameDetails: gameDetails,
      seller: {
        id: order.sellerID,
        username: sellerUsername,
      },
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize first letter
      amount: orderPrice,
      createdAt: creationDate,
    };
  });

  // Wait for all promises to resolve
  const formattedOrders = await Promise.all(formattedOrdersPromises);

  res.status(200).json({
    status: "success",
    results: formattedOrders.length,
    data: formattedOrders,
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  // Check if user is authorized (only admin should see all orders)
  if (req.user.role !== "admin") {
    return next(
      new AppError("You are not authorized to access all orders", 403)
    );
  }

  // Get all orders
  const orders = await Orders.find().sort({ createdAt: -1 }).populate({
    path: "accountID",
    select: "title gameType",
  });

  // Get unique customer and seller IDs from orders
  const customerIds = [...new Set(orders.map((order) => order.clientID))];
  const sellerIds = [...new Set(orders.map((order) => order.sellerID))];

  // Fetch all relevant users in one query
  const users = await User.find({
    _id: { $in: [...customerIds, ...sellerIds] },
  }).select("_id username");

  // Create a map for quick lookup
  const userMap = {};
  users.forEach((user) => {
    userMap[user._id.toString()] = user.username;
  });

  // Format the orders for the frontend
  const formattedOrders = orders.map((order) => {
    // Determine game type based on available data
    const gameType =
      order.game || (order.accountID && order.accountID.gameType) || "Valorant"; // Default to Valorant

    // Get price from order schema (prefer price field over amount for consistency)
    const orderPrice = order.price || order.amount || 0;

    // Format creation date - use "Month Day, Year" format
    const creationDate = order.createdAt || order.creartedAT || new Date();
    const formattedDate = new Date(creationDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Format amount with euro symbol
    const formattedAmount = `€${parseFloat(orderPrice).toFixed(2)}`;

    // Get customer and seller usernames from the map
    const customerId = order.clientID.toString();
    const sellerId = order.sellerID.toString();
    const customerUsername = userMap[customerId] || "Unknown Customer";
    const sellerUsername = userMap[sellerId] || "Unknown Seller";

    return {
      id: order._id,
      title: order.accountID?.title || "Unknown Account",
      gameType: gameType,
      customer: {
        id: order.clientID,
        username: customerUsername,
      },
      seller: {
        id: order.sellerID,
        username: sellerUsername,
      },
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize first letter
      amount: formattedAmount,
      date: formattedDate,
    };
  });

  res.status(200).json({
    status: "success",
    results: formattedOrders.length,
    data: formattedOrders,
  });
});

exports.getOrdersBySellerId = catchAsync(async (req, res, next) => {
  const sellerId = req.params.id;

  // Check if user is authorized to view these orders
  // Only allow if user is admin or if user is the same seller
  if (req.user.role !== "admin" && req.user._id.toString() !== sellerId) {
    return next(
      new AppError("You are not authorized to view these orders", 403)
    );
  }

  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const totalOrders = await Orders.countDocuments({ sellerID: sellerId });
  const totalPages = Math.ceil(totalOrders / limit);

  // Get paginated orders
  const orders = await Orders.find({ sellerID: sellerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "accountID",
      select: "title gameType",
    })
    .populate({
      path: "clientID",
      select: "username _id",
    });

  // Format the orders for the frontend
  const formattedOrders = orders.map((order) => {
    // Determine game type based on available data
    const gameType =
      order.game || (order.accountID && order.accountID.gameType) || "Valorant"; // Default to Valorant

    // Get price from order schema (prefer price field over amount for consistency)
    const orderPrice = order.price || order.amount || 0;

    // Format creation date - use "Month Day, Year" format (e.g., "April 12, 2025")
    const creationDate = order.createdAt || order.creartedAT || new Date();
    const formattedDate = new Date(creationDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Format amount with euro symbol
    const formattedAmount = `€${parseFloat(orderPrice).toFixed(2)}`;

    return {
      id: order._id,
      customerId: order.clientID?._id || "Unknown",
      gameType: gameType,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize first letter
      amount: formattedAmount,
      date: formattedDate,
    };
  });

  res.status(200).json({
    status: "success",
    results: formattedOrders.length,
    totalOrders,
    totalPages,
    currentPage: page,
    data: formattedOrders,
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { accountID, gameType } = req.body;

  if (!accountID) {
    return next(new AppError("Account ID is required", 400));
  }

  // Set client ID from authenticated user
  const clientID = req.user._id;
  const buyer = await User.findById(clientID).select('username');

  // Find seller and other account details based on game type
  let account;
  let sellerID;
  let price;
  let game = gameType || "Valorant"; // Default to Valorant if not specified

  // Use the appropriate model based on game type
  switch (game) {
    case "Valorant":
      account = await Valorant.findById(accountID);
      break;
    case "Brawl Stars":
      account = await BrawlStars.findById(accountID);
      break;
    case "PUBG":
      account = await PUBG.findById(accountID);
      break;
    case "Fortnite":
      account = await Fortnite.findById(accountID);
      break;
    case "League of Legends":
      account = await LeagueOfLegends.findById(accountID);
      break;
    case "Clash of Clans":
      account = await ClashOfClans.findById(accountID);
      break;
    default:
      // Default to Valorant model for now
      account = await Valorant.findById(accountID);
  }

  if (!account) {
    return next(new AppError(`No ${game} account found with that ID`, 404));
  }

  // Extract seller ID and price from account
  sellerID = account.sellerID;
  price = account.price;

  // Fetch seller information for email
  const seller = await User.findById(sellerID);
  if (!seller) {
    return next(new AppError("Seller not found", 404));
  }

  // Create the order
  const order = await Orders.create({
    accountID,
    clientID,
    sellerID,
    amount: price, // Set amount field for compatibility
    price: price, // Set price field as per schema
    game,
    createdAt: Date.now(),
  });

  // Update account status to sold
  account.status = "sold";
  await account.save();

  // Only send email notification if seller has opted in
  if (seller.notificationPreferences && seller.notificationPreferences.newOrder) {
    try {
      // Send email to seller about the new order
      await sendEmail({
        email: seller.email,
        subject: `Your Account Has Been Sold! - ${account.title || 'Account'} (${game})`,
        message: `Your ${game} account has been sold!`,
        orderDetails: {
          orderId: order._id,
          accountId: accountID,
          accountTitle: account.title || 'Game Account',
          accountRefId: account.referenceId || `REF-${accountID.toString().substring(0, 8)}`,
          buyerUsername: buyer ? buyer.username : 'A customer',
          game: game,
          price: price,
          sellerName: seller.username
        }
      });

      console.log(`Order notification email sent to seller: ${seller.email}`);
    } catch (error) {
      console.error('Failed to send order email notification:', error);
      // Don't fail the order creation if email fails
    }
  }

  res.status(201).json({
    status: "success",
    data: order,
  });
});

// For testing: Manually create a chat for an existing order
exports.createChatForOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  // Find the order
  const order = await Orders.findById(orderId);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Only allow this action for admins or the seller of the order
  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== order.sellerID.toString()
  ) {
    return next(
      new AppError(
        "You are not authorized to create a chat for this order",
        403
      )
    );
  }

  try {
    const initialMessage = `Order chat created manually. Order status: ${order.status}`;
    const chat = await createOrderChat(
      order._id,
      order.clientID, // Buyer
      order.sellerID, // Seller
      initialMessage
    );

    res.status(201).json({
      status: "success",
      message: "Chat created successfully",
      data: {
        chatId: chat._id,
      },
    });
  } catch (error) {
    return next(new AppError(`Failed to create chat: ${error.message}`, 500));
  }
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  // Find the order with basic details
  const order = await Orders.findById(orderId);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check authorization - only allow access to admin, the buyer, or the seller
  if (
    req.user.role !== "admin" &&
    order.clientID.toString() !== userId.toString() &&
    order.sellerID.toString() !== userId.toString()
  ) {
    return next(new AppError("You are not authorized to view this order", 403));
  }

  // Get game type from order
  const gameType = order.game || "Valorant"; // Default to Valorant if not specified

  // Get account details based on game type
  let accountDetails;
  switch (gameType) {
    case "Valorant":
      accountDetails = await Valorant.findById(order.accountID);
      break;
    case "Brawl Stars":
      accountDetails = await BrawlStars.findById(order.accountID);
      break;
    case "PUBG":
      accountDetails = await PUBG.findById(order.accountID);
      break;
    case "Fortnite":
      accountDetails = await Fortnite.findById(order.accountID);
      break;
    case "League of Legends":
      accountDetails = await LeagueOfLegends.findById(order.accountID);
      break;
    case "Clash of Clans":
      accountDetails = await ClashOfClans.findById(order.accountID);
      break;
    default:
      // Default to Valorant model for now
      accountDetails = await Valorant.findById(order.accountID);
  }

  if (!accountDetails) {
    return next(new AppError(`Account details not found for this order`, 404));
  }

  // Get buyer and seller details
  const [buyer, seller] = await Promise.all([
    User.findById(order.clientID).select("username email"),
    User.findById(order.sellerID).select("username email"),
  ]);

  if (!buyer || !seller) {
    return next(new AppError("Buyer or seller information is missing", 404));
  }

  // Find associated chat
  const chat = await Chat.findOne({ orderId: order._id });

  // Calculate commission
  const commissionRate = COMMISSION_RATES[gameType] || COMMISSION_RATES.Default;
  const orderPrice = order.price || 0;
  const commissionAmount = (orderPrice * commissionRate) / 100;
  const sellerReceives = orderPrice - commissionAmount;

  // Format account details based on game type
  let formattedAccountDetails = {};

  formattedAccountDetails = {
    title: accountDetails.title,
    login: accountDetails.login,
    password: accountDetails.password,
    emailLogin: accountDetails.email_login,
    emailPassword: accountDetails.email_password,
    server: accountDetails.server,
    deliveryInstructions: accountDetails.delivery_instructions,
    accountData: accountDetails.account_data,
  };

  // Create the response object
  const orderDetails = {
    id: order._id,
    orderNumber: order._id, // Using the MongoDB _id as order number
    status: order.status,
    createdAt: order.creartedAT,
    game: gameType,

    // Account details
    account: formattedAccountDetails,

    // Payment details
    payment: {
      orderPrice: orderPrice,
      commission: {
        rate: `${commissionRate}%`,
        amount: commissionAmount.toFixed(2),
      },
      sellerReceives: sellerReceives.toFixed(2),
    },

    // User details
    buyer: {
      id: buyer._id,
      username: buyer.username,
      email: buyer.email,
    },
    seller: {
      id: seller._id,
      username: seller.username,
      email: seller.email,
    },

    // Chat details
    chat: chat ? {
      id: chat._id,
      lastActivity: chat.lastActivity
    } : null,

    // Feedback details
    review: order.review || null,
    reviewMessage: order.reviewMessage || null
  };

  res.status(200).json({
    status: "success",
    data: orderDetails,
  });
});

exports.markOrderAsReceived = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const { sendChatMessage = true } = req.body; // Option to control chat message

  // Find the order
  const order = await Orders.findById(orderId);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check if the user is the buyer
  if (order.clientID.toString() !== userId.toString()) {
    return next(new AppError("You are not authorized to mark this order as received", 403));
  }

  // Check if the order is already marked as received
  if (order.status === "completed") {
    return next(new AppError("This order is already marked as received", 400));
  }

  // Update the order status to received
  order.status = "completed";
  await order.save();

  // Add a system message to the chat if requested
  if (sendChatMessage) {
    try {
      const chat = await Chat.findOne({ orderId: order._id });
      if (chat) {
        const systemMessage = {
          sender: userId,
          content: `(System)Order has been marked as received by the buyer.`,
          timestamp: Date.now(),
          isSystemMessage: true,
          read: true
        };

        chat.messages.push(systemMessage);
        chat.lastActivity = Date.now();
        await chat.save();
      }
    } catch (chatError) {
      console.error('Error adding system message to chat:', chatError);
      // Don't fail the operation if adding a chat message fails
    }
  }

  res.status(200).json({
    status: "success",
    message: "Order marked as completed",
  });
});

exports.refundOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  // Only admins can refund orders
  if (req.user.role !== "admin" && req.user.role !== "seller") {
    return next(new AppError("Only administrators and sellers can refund orders", 403));
  }

  // Find the order
  const order = await Orders.findById(orderId);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check if order is already refunded
  if (order.status === "refunded") {
    return next(new AppError("This order has already been refunded", 400));
  }

  try {
    // Start a transaction for database consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the order amount and game type
      const orderAmount = order.price || order.amount;
      const gameType = order.game || "Valorant";

      // Calculate commission
      const commissionRate = COMMISSION_RATES[gameType] || COMMISSION_RATES.Default;
      const commissionAmount = (orderAmount * commissionRate) / 100;
      const sellerReceives = orderAmount - commissionAmount;

      // Find the buyer and seller
      const [buyer, seller] = await Promise.all([
        User.findById(order.clientID),
        User.findById(order.sellerID)
      ]);

      if (!buyer || !seller) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError("Buyer or seller not found", 404));
      }

      // Update buyer's wallet - add full amount
      const buyerWalletAmount = (buyer.wallet || 0) + orderAmount;
      await User.findByIdAndUpdate(
        buyer._id,
        { wallet: buyerWalletAmount },
        { session, new: true, runValidators: false }
      );

      // Create a wallet action record for the buyer
      await walletActions.create([{
        user: buyer._id,
        amount: orderAmount,
        type: "deposit",
        message: `Refund for order #${order._id} - ${gameType} account`,
        createdAt: Date.now()
      }], { session });

      // Update seller's wallet - deduct the amount they received
      const sellerWalletAmount = Math.max(0, (seller.wallet || 0) - sellerReceives);
      await User.findByIdAndUpdate(
        seller._id,
        { wallet: sellerWalletAmount },
        { session, new: true, runValidators: false }
      );

      // Create a wallet action record for the seller
      await walletActions.create([{
        user: seller._id,
        amount: sellerReceives,
        type: "withdrawal",
        message: `Deduction for refunded order #${order._id} - ${gameType} account`,
        createdAt: Date.now()
      }], { session });


      // Only deduct from seller's wallet if order was previously completed
      if (order.status === "completed") {
        // Update seller's wallet - deduct the amount they received
        const sellerWalletAmount = Math.max(0, (seller.wallet || 0) - sellerReceives);
        await User.findByIdAndUpdate(
          seller._id,
          { wallet: sellerWalletAmount },
          { session, new: true, runValidators: false }
        );

        // Create a wallet action record for the seller
        await walletActions.create([{
          user: seller._id,
          amount: sellerReceives,
          type: "withdrawal",
          message: `Deduction for refunded order #${order._id} - ${gameType} account`,
          createdAt: Date.now()
        }], { session });
      }

      // Find the game account based on game type
      let accountModel;
      switch (gameType.toLowerCase()) {
        case "valorant":
          accountModel = Valorant;
          break;
        case "pubg":
          accountModel = PUBG || Valorant; // Fallback to Valorant if PUBG model doesn't exist
          break;
        case "fortnite":
          accountModel = Fortnite || Valorant;
          break;
        case "league of legends":
          accountModel = LeagueOfLegends || Valorant;
          break;
        case "brawl stars":
          accountModel = BrawlStars || Valorant;
          break;
        // Add other game models as needed
        default:
          accountModel = Valorant;
      }

      // Find the account and update its status
      if (order.accountID) {
        try {
          const account = await accountModel.findById(order.accountID);
          if (account && account.status === "sold") {
            account.status = "active";
            await account.save({ session });
          }
        } catch (err) {
          console.warn(`Error updating account status: ${err.message}`);
          // Continue with the refund even if account update fails
        }
      }

      // Update order status
      order.status = "refunded";
      await order.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Add notification to chat if it exists
      try {
        const chat = await Chat.findOne({ orderId: order._id });
        if (chat) {
          const refundMessage = {
            sender: req.user._id,
            content: `(System)Order has been refunded by an System.`,
            timestamp: Date.now(),
            isSystemMessage: true,
            read: true
          };

          chat.messages.push(refundMessage);
          chat.lastActivity = Date.now();
          await chat.save();
        }
      } catch (chatError) {
        console.error("Error adding refund message to chat:", chatError);
        // Don't fail the refund if adding chat message fails
      }

      res.status(200).json({
        status: "success",
        message: "Order has been refunded successfully",
        data: {
          orderId: order._id,
          buyerId: buyer._id,
          sellerId: seller._id,
          amountRefunded: orderAmount,
          newOrderStatus: "refunded"
        }
      });
    } catch (transactionError) {
      // If an error occurs during the transaction, abort it
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("Refund error:", error);
    return next(new AppError("Failed to process refund. Please try again later.", 500));
  }
});

// Add a new method for submitting feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { review, reviewMessage } = req.body;
    const userId = req.user._id;

    // Validate feedback type
    if (!review || !['positive', 'negative'].includes(review)) {
      return res.status(400).json({
        status: 'error',
        message: 'Feedback must be either positive or negative'
      });
    }

    // Find the order
    const order = await Orders.findById(id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Make sure only the buyer (client) can leave feedback
    if (order.clientID.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the buyer can leave feedback on an order'
      });
    }

    // Make sure the order is completed or refunded (can't leave feedback on processing orders)
    if (order.status !== 'completed' && order.status !== 'refunded') {
      return res.status(400).json({
        status: 'error',
        message: 'Feedback can only be left on completed or refunded orders'
      });
    }

    // Update the order with the feedback
    order.review = review;

    // Only set reviewMessage if it's provided
    if (reviewMessage) {
      order.reviewMessage = reviewMessage;
    }

    await order.save();

    return res.status(200).json({
      status: 'success',
      data: {
        order
      },
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while submitting feedback'
    });
  }
};

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  // Find the order
  const order = await Orders.findById(orderId);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check if the user is the seller
  if (order.sellerID.toString() !== userId.toString()) {
    return next(new AppError("Only the seller can cancel this order", 403));
  }

  try {
    // Start a transaction for database consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the order amount
      const orderAmount = order.price || order.amount;
      const gameType = order.game || "Valorant";

      // Calculate commission - needed to determine how much to deduct from seller
      const commissionRate = COMMISSION_RATES[gameType] || COMMISSION_RATES.Default;
      const commissionAmount = (orderAmount * commissionRate) / 100;
      const sellerReceives = orderAmount - commissionAmount;

      // Find the buyer and seller
      const [buyer, seller] = await Promise.all([
        User.findById(order.clientID),
        User.findById(order.sellerID)
      ]);

      if (!buyer || !seller) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError("Buyer or seller not found", 404));
      }

      // Update buyer's wallet - add full amount
      const buyerWalletAmount = (buyer.wallet || 0) + orderAmount;
      await User.findByIdAndUpdate(
        buyer._id,
        { wallet: buyerWalletAmount },
        { session, new: true, runValidators: false }
      );

      // Create a wallet action record for the buyer
      await walletActions.create([{
        user: buyer._id,
        amount: orderAmount,
        type: "deposit",
        message: `Refund for cancelled order #${order._id}`,
        createdAt: Date.now()
      }], { session });

      // Update seller's wallet - deduct the amount they would have received
      // Only if the seller has enough balance
      const sellerCurrentWallet = seller.wallet || 0;
      if (sellerCurrentWallet >= sellerReceives) {
        const sellerUpdatedWallet = sellerCurrentWallet - sellerReceives;
        await User.findByIdAndUpdate(
          seller._id,
          { wallet: sellerUpdatedWallet },
          { session, new: true, runValidators: false }
        );

        // Create a wallet action record for the seller
        await walletActions.create([{
          user: seller._id,
          amount: sellerReceives,
          type: "withdrawal",
          message: `Deduction for cancelled order #${order._id} - ${gameType} account`,
          createdAt: Date.now()
        }], { session });
      } else {
        console.warn(`Seller ${seller._id} doesn't have enough balance for deduction. No wallet update performed.`);
        // Create a debt record or handle insufficient funds scenario
      }

      // Find the game account based on game type
      let accountModel;
      switch (gameType.toLowerCase()) {
        case "valorant":
          accountModel = Valorant;
          break;
        case "pubg":
          accountModel = PUBG || Valorant;
          break;
        case "fortnite":
          accountModel = Fortnite || Valorant;
          break;
        case "league of legends":
          accountModel = LeagueOfLegends || Valorant;
          break;
        case "brawl stars":
          accountModel = BrawlStars || Valorant;
          break;
        default:
          accountModel = Valorant;
      }

      // Find the account and update its status back to active
      if (order.accountID) {
        try {
          const account = await accountModel.findById(order.accountID);
          if (account && account.status === "sold") {
            account.status = "active";
            await account.save({ session });
          }
        } catch (err) {
          console.warn(`Error updating account status: ${err.message}`);
          // Continue with the cancellation even if account update fails
        }
      }

      // Update order status
      order.status = "refunded"; // Using refunded status for cancelled orders
      await order.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Add notification to chat if it exists
      try {
        const chat = await Chat.findOne({ orderId: order._id });
        if (chat) {
          const systemMessage = {
            sender: userId,
            content: `(System)Order has been cancelled by the seller.`,
            timestamp: Date.now(),
            isSystemMessage: true,
            read: true
          };

          chat.messages.push(systemMessage);
          chat.lastActivity = Date.now();
          await chat.save();
        }
      } catch (chatError) {
        console.error("Error adding cancellation message to chat:", chatError);
        // Don't fail the cancellation if adding chat message fails
      }

      res.status(200).json({
        status: "success",
        message: "Order has been cancelled successfully",
        data: {
          orderId: order._id,
          status: "refunded"
        }
      });
    } catch (transactionError) {
      // If an error occurs during the transaction, abort it
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error) {
    console.error("Cancel order error:", error);
    return next(new AppError("Failed to cancel order. Please try again later.", 500));
  }
});

exports.disputeOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const { disputeReason } = req.body;

  // Find the order
  const order = await Orders.findById(orderId);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Only the buyer can dispute an order
  if (order.clientID.toString() !== userId.toString()) {
    return next(new AppError("Only the buyer can dispute this order", 403));
  }

  // Check if the order is already disputed or refunded
  if (order.status === "disputed") {
    return next(new AppError("This order is already disputed", 400));
  }

  if (order.status === "refunded") {
    return next(new AppError("This order has already been refunded", 400));
  }

  // Update order status to disputed
  order.status = "disputed";

  // Save dispute reason if provided
  if (disputeReason) {
    order.disputeReason = disputeReason;
  }

  await order.save();

  // Add notification to chat if it exists
  try {
    const chat = await Chat.findOne({ orderId: order._id });
    if (chat) {
      console.log("chat found");
      const systemMessage = {
        sender: "system",
        content: `(System)Order status updated to: disputed${disputeReason ? '\nReason: ' + disputeReason : ''}`,
        timestamp: Date.now(),
        isSystemMessage: true,
        read: true
      };
      console.log("systemMessage", systemMessage);
      chat.messages.push(systemMessage);
      chat.lastActivity = Date.now();
      await chat.save();
    }
  } catch (chatError) {
    console.error("Error adding dispute message to chat:", chatError);
    // Don't fail the dispute if adding chat message fails
  }

  res.status(200).json({
    status: "success",
    message: "Order has been disputed successfully",
    data: {
      orderId: order._id,
      status: "disputed"
    }
  });
});

exports.closeDispute = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  // Find the order
  const order = await Orders.findById(orderId);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check if the user is the buyer
  if (order.clientID.toString() !== userId.toString()) {
    return next(new AppError("Only the buyer can close a dispute", 403));
  }

  // Check if the order is actually in disputed status
  if (order.status !== "disputed") {
    return next(new AppError("This order is not currently disputed", 400));
  }

  // Update the order status to completed
  order.status = "completed";
  await order.save();

  // Add a system message to the chat
  try {
    const chat = await Chat.findOne({ orderId: order._id });
    if (chat) {
      const systemMessage = {
        sender: userId,
        content: "(System)Dispute closed by the buyer. Order marked as received.",
        timestamp: Date.now(),
        isSystemMessage: true,
        read: true
      };

      chat.messages.push(systemMessage);
      chat.lastActivity = Date.now();
      await chat.save();
    }
  } catch (chatError) {
    console.error('Error adding system message to chat:', chatError);
    // Don't fail the operation if adding a chat message fails
  }

  res.status(200).json({
    status: "success",
    message: "Dispute closed and order marked as completed",
  });
});

exports.getDisputedOrders = catchAsync(async (req, res, next) => {
  // Check if user is authorized (only admin should see all disputed orders)
  if (req.user.role !== "admin") {
    return next(
      new AppError("You are not authorized to access disputed orders", 403)
    );
  }

  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const totalOrders = await Orders.countDocuments({ status: "disputed" });
  const totalPages = Math.ceil(totalOrders / limit);

  // Get only disputed orders
  const disputedOrders = await Orders.find({ status: "disputed" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "accountID",
      select: "title gameType",
    });

  // Get all unique client and seller IDs
  const clientIds = [...new Set(disputedOrders.map(order => order.clientID))];
  const sellerIds = [...new Set(disputedOrders.map(order => order.sellerID))];

  // Fetch all users in one query for efficiency
  const users = await User.find({
    _id: { $in: [...clientIds, ...sellerIds] }
  }).select('_id username email');

  // Create a map for quick lookups
  const userMap = {};
  users.forEach(user => {
    userMap[user._id.toString()] = {
      username: user.username,
      email: user.email
    };
  });

  // Format the orders for the frontend
  const formattedOrders = await Promise.all(disputedOrders.map(async (order) => {
    // Determine game type based on available data
    const gameType =
      order.game || (order.accountID && order.accountID.gameType) || "Valorant"; // Default to Valorant

    // Get price from order schema
    const orderPrice = order.price || order.amount || 0;

    // Format creation date
    const creationDate = order.createdAt || order.creartedAT || new Date();
    const formattedDate = new Date(creationDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Format amount with currency symbol
    const formattedAmount = `$${parseFloat(orderPrice).toFixed(2)}`;

    // Get customer and seller info from user map
    const clientIdStr = order.clientID.toString();
    const sellerIdStr = order.sellerID.toString();

    const customerInfo = userMap[clientIdStr] || { username: 'Unknown Customer' };
    const sellerInfo = userMap[sellerIdStr] || { username: 'Unknown Seller' };

    return {
      id: order._id,
      customer: customerInfo.username,
      customerEmail: customerInfo.email || 'Unknown Email',
      customerId: clientIdStr,
      seller: sellerInfo.username,
      sellerEmail: sellerInfo.email || 'Unknown Email',
      sellerId: sellerIdStr,
      gameType: gameType,
      amount: formattedAmount,
      disputeReason: order.disputeReason || "No reason provided",
      date: formattedDate,
    };
  }));

  res.status(200).json({
    status: "success",
    results: formattedOrders.length,
    totalOrders,
    totalPages,
    currentPage: page,
    data: formattedOrders,
  });
});

exports.resolveDispute = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const { resolution } = req.body;

  // Check if user is authorized (only admin can resolve disputes)
  if (req.user.role !== "admin") {
    return next(
      new AppError("You are not authorized to resolve disputes", 403)
    );
  }

  // Validate resolution type
  if (!resolution || !['approve', 'refund'].includes(resolution)) {
    return next(
      new AppError("Resolution must be either 'approve' or 'refund'", 400)
    );
  }

  // Find the order
  const order = await Orders.findById(orderId);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check if the order is actually disputed
  if (order.status !== "disputed") {
    return next(new AppError("This order is not currently disputed", 400));
  }

  // Update the order based on resolution
  if (resolution === 'approve') {
    // If approving, mark as completed
    order.status = "completed";
    await order.save();

    // Add a system message to the chat
    try {
      const chat = await Chat.findOne({ orderId: order._id });
      if (chat) {
        const systemMessage = {
          sender: req.user._id,
          content: "(System)Dispute resolved by admin. Order approved and marked as completed.",
          timestamp: Date.now(),
          isSystemMessage: true,
          read: true
        };

        chat.messages.push(systemMessage);
        chat.lastActivity = Date.now();
        await chat.save();
      }
    } catch (chatError) {
      console.error('Error adding system message to chat:', chatError);
      // Don't fail the operation if adding a chat message fails
    }

    res.status(200).json({
      status: "success",
      message: "Dispute resolved in favor of seller. Order marked as completed.",
    });
  } else {
    // If refunding, use the refund function
    // We're reusing the existing refundOrder functionality
    // Save the order ID for the refund process
    req.params.id = orderId;

    // Add a system message to the chat
    try {
      const chat = await Chat.findOne({ orderId: order._id });
      if (chat) {
        const systemMessage = {
          sender: req.user._id,
          content: "(System)Dispute resolved by admin. Order refunded to buyer.",
          timestamp: Date.now(),
          isSystemMessage: true,
          read: true
        };

        chat.messages.push(systemMessage);
        chat.lastActivity = Date.now();
        await chat.save();
      }
    } catch (chatError) {
      console.error('Error adding system message to chat:', chatError);
      // Don't fail the operation if adding a chat message fails
    }

    // Call the refundOrder function
    return exports.refundOrder(req, res, next);
  }
});

exports.getSellerStats = catchAsync(async (req, res, next) => {
  const sellerId = req.params.id;

  // Find orders for this seller that are completed
  const orders = await Orders.find({
    sellerID: sellerId,
    status: "completed"
  });

  // Count total completed sales
  const totalSales = orders.length;

  // Calculate rating
  let positiveReviews = 0;
  let totalReviews = 0;

  orders.forEach(order => {
    if (order.review) {
      totalReviews++;
      if (order.review === 'positive') {
        positiveReviews++;
      }
    }
  });

  // Calculate the rating percentage
  const rating = totalReviews > 0
    ? Math.round((positiveReviews / totalReviews) * 100)
    : 100; // Default to 100% if no reviews

  res.status(200).json({
    status: "success",
    data: {
      totalSales,
      rating,
      totalReviews,
      positiveReviews
    }
  });
});

exports.getOrderByAccountId = catchAsync(async (req, res, next) => {
  const accountId = req.params.accountId;

  // Find the order with the given account ID
  const order = await Orders.findOne({ accountID: accountId });

  if (!order) {
    return next(new AppError("No order found with that account ID", 404));
  }

  // Check authorization - only allow access to admin, the buyer, or the seller
  if (
    req.user.role !== "admin" &&
    order.sellerID.toString() !== req.user._id.toString() &&
    order.clientID.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You are not authorized to view this order", 403));
  }

  // Get game type from order
  const gameType = order.game || "Valorant"; // Default to Valorant if not specified

  // Get account details based on game type
  let accountDetails;
  switch (gameType) {
    case "Valorant":
      accountDetails = await Valorant.findById(order.accountID);
      break;
    case "Brawl Stars":
      accountDetails = await BrawlStars.findById(order.accountID);
      break;
    case "PUBG":
      accountDetails = await PUBG.findById(order.accountID);
      break;
    case "Fortnite":
      accountDetails = await Fortnite.findById(order.accountID);
      break;
    case "League of Legends":
      accountDetails = await LeagueOfLegends.findById(order.accountID);
      break;
    case "Clash of Clans":
      accountDetails = await ClashOfClans.findById(order.accountID);
      break;
    default:
      // Default to Valorant model for now
      accountDetails = await Valorant.findById(order.accountID);
  }

  if (!accountDetails) {
    return next(new AppError(`Account details not found for this order`, 404));
  }

  // Get buyer and seller details
  const [buyer, seller] = await Promise.all([
    User.findById(order.clientID).select("username email"),
    User.findById(order.sellerID).select("username email"),
  ]);

  // Format response
  const formattedOrder = {
    id: order._id,
    status: order.status,
    price: order.price,
    createdAt: order.createdAt,
    account: {
      id: accountDetails._id,
      title: accountDetails.title,
      gameType: gameType,
      credentials: accountDetails.login && accountDetails.password ?
        `${accountDetails.login}:${accountDetails.password}` : "Protected",
    },
    buyer: {
      id: buyer._id,
      username: buyer.username,
      email: buyer.email,
    },
    seller: {
      id: seller._id,
      username: seller.username,
      email: seller.email,
    },
  };

  res.status(200).json({
    status: "success",
    data: {
      order: formattedOrder,
    },
  });
});

