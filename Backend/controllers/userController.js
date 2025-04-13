const User = require('../models/user');
const valorant = require ("../models/valorant")
const orders = require ("../models/order")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const walletActions = require('../models/wallet');

exports.getAllUsers = catchAsync( async (req, res , next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getAllSellers = catchAsync(async (req , res , next) => {
  const sellers = await User.find({ role: "seller" }).select("username email wallet status _id joinDate");

  const sellerData = await Promise.all(
    sellers.map(async (seller) => {
      // Get the number of orders for the seller
      const orderCount = await orders.countDocuments({ sellerID: seller._id });

      // Get the number of accounts listed by the seller
      const accountCount = await valorant.countDocuments({ sellerID: seller._id });

      return {
        id: seller._id,
        name: seller.username,
        email: seller.email,
        wallet: seller.wallet,
        status: seller.status,
        totalOrders: orderCount,
        totalListings: accountCount,
        joinDate: seller.joinDate
      };
    })
  );

  res.status(200).json({
    status: "success",
    data: sellerData,
  });
})

exports.getSeller = catchAsync(async (req, res, next) => {
  console.log("here in get seller")
  const sellerId  = req.params.id;

  console.log(req.params.id)

  // Get seller basic info
  const seller = await User.findById(sellerId);
  if (!seller) {
    return next(new AppError('Seller not found', 404));
  }


  // Get total orders count
  const totalOrders = await orders.countDocuments({ sellerID: sellerId });


  // Get total listings count (excluding sold accounts)
  const totalListings = await valorant.countDocuments({ 
    sellerID: sellerId,
    status: { $ne: "sold" } // Only count non-sold listings
  });

  // Get recent orders (last 3)
  const recentOrders = await orders.find({ sellerID: sellerId })
    .sort({ createdAt: -1 })
    .limit(1)
    .select('_id price createdAt');

  // Get recent wallet activities (last 3)
  const recentWalletActivities = await walletActions.find({ user: sellerId })
    .sort({ createdAt: -1 })
    .limit(1)
    .select('type amount message ');

  // Format the response
  const response = {
    id: seller._id,
    name: seller.username,
    email: seller.email,
    status: seller.isSuspended ? 'Suspended' : 'Active',
    totalOrders,
    totalListings,
    walletBalance: seller.wallet,
    joinDate: seller.joinDate,
    recentActivity: [
      ...recentOrders.map(order => ({
        type: 'Order',
        id: order._id,
        amount: order.price,
        date: order.createdAt
      })),
      ...recentWalletActivities.map(activity => ({
        type: 'Wallet',
        id: activity._id,
        amount: activity.amount,
        date: activity.createdAt
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 3)
  };

  res.status(200).json({
    status: 'success',
    data: response
  });
});

exports.myData = catchAsync(async (req , res , next ) =>{
  console.log(req.user)
  res.status(200).json({
    status: "success",
    data : req.user
  });
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined createUser",
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined getUser",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined updateUser",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined deleteUser",
  });
};


