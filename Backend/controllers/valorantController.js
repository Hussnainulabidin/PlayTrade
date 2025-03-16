const valorant = require("./../models/valorant");
const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError')

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

exports.getAllAccounts = catchAsync(async (req, res , next) => {
  const features = new APIFeatures(valorant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const accounts = await features.query;

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      accounts,
    },
  });
});

exports.createAccount = catchAsync(async (req, res, next) => {
  const newAccount = await valorant.create({
    ...req.body, // Spread existing data from request body
    user: req.user._id, // Add user ID from `authController.protect`
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
    return next(new AppError('No account found with that ID' , 404))
  }

  await valorant.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });

  const updatedAccount = await valorant.findById(req.params.id);

  console.log("Account found:", updatedAccount.timeSinceLastUpdated);

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      account: updatedAccount,
    },
  });
});

exports.updateAccount = catchAsync(async (req, res, next) => {
  const accounts = await valorant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!accounts) {
    return next(new AppError('No account found with that ID' , 404))
  }

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      accounts,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const accounts = await valorant.findByIdAndDelete(req.params.id);

  if (!accounts) {
    return next(new AppError('No account found with that ID' , 404))
  }

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: {
      accounts,
    },
  });
});
