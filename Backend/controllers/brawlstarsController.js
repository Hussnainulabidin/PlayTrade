const brawlstars = require("./../models/brawlstars");
const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError')

exports.getTopAccounts = catchAsync(async (req, res, next) => {
  const topAccounts = await brawlstars
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
  const { search, rank, brawlersCount, trophiesCount, xpLevel, price } = req.query;
  
  let searchQuery = {};

  // Handle search query
  if (search) {
    searchQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Handle rank filter
  if (rank) {
    searchQuery['account_data.rank'] = rank;
  }

  // Handle brawlers count filter
  if (brawlersCount) {
    const minBrawlers = parseInt(brawlersCount);
    searchQuery['account_data.BrawlersCount'] = { $gte: minBrawlers };
  }

  // Handle trophies count filter
  if (trophiesCount) {
    const minTrophies = parseInt(trophiesCount);
    searchQuery['account_data.TrophiesCount'] = { $gte: minTrophies };
  }

  // Handle XP level filter
  if (xpLevel) {
    const minXPLevel = parseInt(xpLevel);
    searchQuery['account_data.XPLevel'] = { $gte: minXPLevel };
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

  const accounts = await brawlstars.find(searchQuery);

  res.status(200).json({
    status: "success",
    data: { accounts },
  });
});

exports.createAccount = catchAsync(async (req, res, next) => {
  const newAccount = await brawlstars.create({
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

exports.getAccount = catchAsync(async (req, res, next) => {
  const account = await brawlstars.findById(req.params.id);

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
  const account = await brawlstars.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this account', 403));
  }

  const updatedAccount = await brawlstars.findByIdAndUpdate(req.params.id, req.body, {
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
  const account = await brawlstars.findById(req.params.id);

  if (!account) {
    return next(new AppError('No account found with that ID', 404));
  }

  // Check if the user is the seller or an admin
  if (account.sellerID.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this account', 403));
  }

  await brawlstars.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: null, // No data is returned after deletion
  });
}); 