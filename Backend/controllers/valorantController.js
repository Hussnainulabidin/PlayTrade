const valorant = require("./../models/valorant");
const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError')
const cloudinary = require('./../configuration/cloudinary')

exports.getTopAccounts = catchAsync(async (req, res, next) => {
  const topAccounts = await valorant
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
  const { search, server, rank, price, page = 1, limit = 12 } = req.query;
  
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
      { 'account_data.current_rank': { $regex: search, $options: 'i' } },
      { server: { $regex: search, $options: 'i' } }
    ];
  }

  // Handle server filter
  if (server) {
    searchQuery.server = server;
  }

  // Handle rank filter
  if (rank) {
    searchQuery['account_data.current_rank'] = rank;
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

  // Count total documents matching the query
  const totalAccounts = await valorant.countDocuments(searchQuery);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalAccounts / limitNum);

  // Get paginated accounts
  const accounts = await valorant
    .find(searchQuery)
    .populate({
      path: 'sellerID',
      select: 'username joinDate photo profilePicture'
    })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    status: "success",
    data: { 
      accounts,
      page: pageNum,
      limit: limitNum,
      totalAccounts,
      totalPages
    },
  });
});

exports.createAccount = catchAsync(async (req, res, next) => {
  // Upload gallery images to Cloudinary
  const galleryUploads = [];
  // Create the account with Cloudinary URLs
  const newAccount = await valorant.create({
    ...req.body,
    sellerID: req.user._id,
    gallery: galleryUploads
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

exports.getAccount = catchAsync(async (req, res, next) => {
  const account = await valorant.findById(req.params.id).populate({
    path: 'sellerID',
    select: 'username joinDate photo profilePicture'
  });

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  // Increment the views count
  account.views += 1;
  await account.save();

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      account,
    },
  });
});

exports.addPictures = catchAsync(async (req, res, next) => {
  const account = await valorant.findById(req.params.id);

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
      folder: 'valorant_accounts'
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

exports.updateAccount = catchAsync(async (req, res, next) => {
  const account = await valorant.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this account', 403));
  }

  const updatedAccount = await valorant.findByIdAndUpdate(req.params.id, req.body, {
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
  const account = await valorant.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  // Check if the user is the seller or an admin
  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this account', 403));
  }

  await valorant.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: null, // No data is returned after deletion
  });
});
