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
  const { search, server, rank, price } = req.query;

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

  console.log('Search Query:', searchQuery);

  const accounts = await valorant.find(searchQuery);

  res.status(200).json({
    status: "success",
    data: { accounts },
  });
});

exports.createAccount = catchAsync(async (req, res, next) => {
  // Upload gallery images to Cloudinary
  const galleryUploads = [];
  console.log(req.body);
  console.log(req.body.gallery[0].name);

  // Upload an image
  const uploadResult = await cloudinary.uploader
    .upload(
      `${req.body.gallery[0].name}`, {
      public_id: 'valorant-accounts',
    }
    )
    .catch((error) => {
      console.log(error);
    });

  console.log(uploadResult);
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
  const account = await valorant.findById(req.params.id);

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
