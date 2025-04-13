const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError')
const Orders = require("../models/order");
const Valorant = require("../models/valorant");
const User = require("../models/user");
// Import other game models here when they are created

exports.getAllOrders = catchAsync(async (req, res, next) => {
  // Check if user is authorized (only admin should see all orders)
  if (req.user.role !== "admin") {
    return next(new AppError("You are not authorized to access all orders", 403));
  }

  // Get all orders
  const orders = await Orders.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "accountID",
      select: "title gameType"
    });

  // Get unique customer and seller IDs from orders
  const customerIds = [...new Set(orders.map(order => order.clientID))];
  const sellerIds = [...new Set(orders.map(order => order.sellerID))];
  
  // Fetch all relevant users in one query
  const users = await User.find({
    _id: { $in: [...customerIds, ...sellerIds] }
  }).select('_id username');
  
  // Create a map for quick lookup
  const userMap = {};
  users.forEach(user => {
    userMap[user._id.toString()] = user.username;
  });

  // Format the orders for the frontend
  const formattedOrders = orders.map(order => {
    // Determine game type based on available data
    const gameType = order.game || 
      (order.accountID && order.accountID.gameType) || 
      "Valorant"; // Default to Valorant
    
    // Get price from order schema (prefer price field over amount for consistency)
    const orderPrice = order.price || order.amount || 0;
    
    // Format creation date - use "Month Day, Year" format
    const creationDate = order.createdAt || order.creartedAT || new Date();
    const formattedDate = new Date(creationDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
        username: customerUsername
      },
      seller: {
        id: order.sellerID,
        username: sellerUsername
      },
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize first letter
      amount: formattedAmount,
      date: formattedDate,
    };
  });

  res.status(200).json({ 
    status: "success", 
    results: formattedOrders.length,
    data: formattedOrders 
  });
});

exports.getOrdersBySellerId = catchAsync(async (req, res, next) => {
  const sellerId = req.params.id;
  
  // Check if user is authorized to view these orders
  // Only allow if user is admin or if user is the same seller
  if (req.user.role !== "admin" && req.user._id.toString() !== sellerId) {
    return next(new AppError("You are not authorized to view these orders", 403));
  }

  const orders = await Orders.find({ sellerID: sellerId })
    .sort({ createdAt: -1 })
    .populate({
      path: "accountID",
      select: "title gameType"
    })
    .populate({
      path: "clientID",
      select: "username _id"
    });

  // Format the orders for the frontend
  const formattedOrders = orders.map(order => {
    // Determine game type based on available data
    const gameType = order.game || 
      (order.accountID && order.accountID.gameType) || 
      "Valorant"; // Default to Valorant
    
    // Get price from order schema (prefer price field over amount for consistency)
    const orderPrice = order.price || order.amount || 0;
    
    // Format creation date - use "Month Day, Year" format (e.g., "April 12, 2025")
    const creationDate = order.createdAt || order.creartedAT || new Date();
    const formattedDate = new Date(creationDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
    data: formattedOrders 
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { accountID, gameType } = req.body;
  
  if (!accountID) {
    return next(new AppError("Account ID is required", 400));
  }
  
  // Set client ID from authenticated user
  const clientID = req.user._id;
  
  // Find seller and other account details based on game type
  let account;
  let sellerID;
  let price;
  let game = gameType || "Valorant"; // Default to Valorant if not specified
  
  // Use the appropriate model based on game type
  switch(game) {
    case "Valorant":
      account = await Valorant.findById(accountID);
      break;
    // Add cases for other game types as they are created
    // case "PUBG":
    //   account = await PUBG.findById(accountID);
    //   break;
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
  
  // Create the order
  const order = await Orders.create({
    accountID,
    clientID,
    sellerID,
    amount: price, // Set amount field for compatibility
    price: price,  // Set price field as per schema
    game,
    createdAt: Date.now()
  });
  
  // Update account status to sold
  account.status = "sold";
  await account.save();

  res.status(201).json({
    status: "success",
    data: order
  });
});
