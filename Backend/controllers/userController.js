const User = require('../models/user');
const valorant = require ("../models/valorant")
const orders = require ("../models/order")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const walletActions = require('../models/wallet');
const clashofclans = require("./../models/clashofclans");
const leagueoflegends = require("./../models/leagueoflegends");
const fortnite = require("./../models/fortnite");
const brawlstars = require("./../models/brawlstars");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'public/img/users';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  }
});

// Filter files to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for handling single file upload
exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  // Use the upload middleware
  upload.single('profilePicture')(req, res, async (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }
    
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }
    
    // Update user profile picture in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: `/img/users/${req.file.filename}` },
      { new: true, runValidators: false }
    );
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      success: true,
      profilePicture: `/img/users/${req.file.filename}`
    });
  });
});

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

      // Get the number of accounts listed by the seller for each game type
      const [valorantCount, clashOfClansCount, leagueOfLegendsCount, fortniteCount, brawlStarsCount] = await Promise.all([
        valorant.countDocuments({ sellerID: seller._id }),
        clashofclans.countDocuments({ sellerID: seller._id }),
        leagueoflegends.countDocuments({ sellerID: seller._id }),
        fortnite.countDocuments({ sellerID: seller._id }),
        brawlstars.countDocuments({ sellerID: seller._id })
      ]);

      // Sum up all game accounts
      const totalAccounts = valorantCount + clashOfClansCount + leagueOfLegendsCount + fortniteCount + brawlStarsCount;

      return {
        id: seller._id,
        name: seller.username,
        email: seller.email,
        wallet: seller.wallet,
        status: seller.status,
        totalOrders: orderCount,
        totalListings: totalAccounts,
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

  // Get total listings count for each game type (excluding sold accounts)
  const [valorantCount, clashOfClansCount, leagueOfLegendsCount, fortniteCount, brawlStarsCount] = await Promise.all([
    valorant.countDocuments({ 
      sellerID: sellerId,
      status: { $ne: "sold" } 
    }),
    clashofclans.countDocuments({ 
      sellerID: sellerId,
      status: { $ne: "sold" } 
    }),
    leagueoflegends.countDocuments({ 
      sellerID: sellerId,
      status: { $ne: "sold" } 
    }),
    fortnite.countDocuments({ 
      sellerID: sellerId,
      status: { $ne: "sold" } 
    }),
    brawlstars.countDocuments({ 
      sellerID: sellerId,
      status: { $ne: "sold" } 
    })
  ]);

  // Sum up all listings
  const totalListings = valorantCount + clashOfClansCount + leagueOfLegendsCount + fortniteCount + brawlStarsCount;

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

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    requestedAt: new Date().toISOString(),
    data: {
      user
    }
  });
});

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

exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== 'object') {
    return next(new AppError('Please provide valid notification preferences', 400));
  }

  // Get only the valid notification preference fields
  const validPreferences = {};
  const allowedPreferences = ['newOrder', 'newMessage', 'orderDisputed', 'paymentUpdated', 'withdrawUpdates'];
  
  allowedPreferences.forEach(pref => {
    if (typeof preferences[pref] === 'boolean') {
      validPreferences[`notificationPreferences.${pref}`] = preferences[pref];
    }
  });

  // Update user notification preferences
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: validPreferences },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    success: true,
    data: {
      notificationPreferences: updatedUser.notificationPreferences
    }
  });
});


