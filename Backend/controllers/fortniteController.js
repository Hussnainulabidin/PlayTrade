const fortnite = require("./../models/fortnite");
const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError')
const cloudinary = require('./../configuration/cloudinary')

exports.getTopAccounts = catchAsync(async (req, res, next) => {
  const topAccounts = await fortnite
    .find()
    .sort({ views: -1 })
    .limit(5);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: topAccounts.length,
    data: {
      accounts: topAccounts,
    },
  });
});

exports.getAllAccounts = catchAsync(async (req, res, next) => {
  const { search, platform, level, skinsCount, price, page = 1, limit = 12 } = req.query;

  // Convert page and limit to numbers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Calculate skip value for pagination
  const skip = (pageNum - 1) * limitNum;

  let searchQuery = {};

  // Handle search query
  if (search) {
    searchQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ign: { $regex: search, $options: 'i' } }
    ];
  }

  // Handle platform filter
  if (platform) {
    searchQuery['account_data.mainPlatform'] = platform;
  }

  // Handle level filter
  if (level) {
    const minLevel = parseInt(level);
    searchQuery['account_data.level'] = { $gte: minLevel };
  }

  // Handle skins count filter
  if (skinsCount) {
    const minSkins = parseInt(skinsCount);
    searchQuery['account_data.SkinsCount'] = { $gte: minSkins };
  }

  // Handle price range filter
  if (price) {
    const [min, max] = price.split('-').map(Number);
    if (max) {
      searchQuery.price = { $gte: min, $lte: max };
    } else {
      // Handle "500+" case
      searchQuery.price = { $gte: min };
    }
  }

  console.log('Search Query:', searchQuery);

  // Count total documents matching the query
  const totalAccounts = await fortnite.countDocuments(searchQuery);

  // Calculate total pages
  const totalPages = Math.ceil(totalAccounts / limitNum);

  const accounts = await fortnite
    .find(searchQuery)
    .populate({
      path: 'sellerID',
      select: 'username joinDate photo profilePicture verified'
    })
    .skip(skip)
    .limit(limitNum);

  // Get seller IDs from accounts
  const sellerIds = accounts.map(account => account.sellerID._id);

  // Fetch seller feedback stats
  const sellerStats = {};

  // Only fetch stats if we have accounts
  if (sellerIds.length > 0) {
    // Create a mapping of seller stats for each seller ID
    const Order = require('../models/order');

    for (const sellerId of sellerIds) {
      // Find orders for this seller that are completed
      const orders = await Order.find({
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

      // Store the stats for this seller
      sellerStats[sellerId] = {
        totalSales,
        rating,
        totalReviews,
        positiveReviews
      };
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      accounts,
      sellerStats,
      page: pageNum,
      limit: limitNum,
      totalAccounts,
      totalPages
    },
  });
});

exports.createAccount = catchAsync(async (req, res, next) => {
  const newAccount = await fortnite.create({
    ...req.body,
    sellerID: req.user._id,
  });

  console.log("Account created successfully:", newAccount);

  res.status(201).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      account: newAccount,
    },
  });
});

exports.addPictures = catchAsync(async (req, res, next) => {
  const account = await fortnite.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  // Check if the user is the seller or an admin
  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this account', 403));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  if (req.files.length > 5) {
    return next(new AppError('Maximum 5 images can be uploaded at once', 400));
  }

  // Upload all images to Cloudinary
  const uploadPromises = req.files.map(file =>
    cloudinary.uploader.upload(file.path, {
      folder: 'fortnite_accounts'
    })
  );

  try {
    const results = await Promise.all(uploadPromises);

    // Add all new image URLs to the account's gallery array
    const imageUrls = results.map(result => result.secure_url);

    // Update account with new images
    account.gallery = [...account.gallery, ...imageUrls];
    await account.save();

    // Delete all temporary files if fs is available
    if (req.files[0] && req.files[0].path) {
      const fs = require('fs');
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        account
      }
    });
  } catch (error) {
    return next(new AppError(`Error uploading images: ${error.message}`, 500));
  }
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const account = await fortnite.findById(req.params.id)
    .populate({
      path: 'sellerID',
      select: 'username email joinDate photo profilePicture verified rating'
    });

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  // Increment the views count if it exists in the schema
  if (account.views !== undefined) {
    account.views += 1;
    await account.save();
  }

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      account,
    },
  });
});

exports.updateAccount = catchAsync(async (req, res, next) => {
  const account = await fortnite.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this account', 403));
  }

  const updatedAccount = await fortnite.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      accounts: updatedAccount,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const account = await fortnite.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  // Check if the user is the seller or an admin
  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this account', 403));
  }

  await fortnite.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: null, // No data is returned after deletion
  });
}); 