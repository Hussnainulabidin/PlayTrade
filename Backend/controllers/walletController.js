const walletActions = require("../models/wallet");
const User = require("../models/user");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError');

exports.creditWallet = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { amount, message } = req.body;

    if (!amount || amount <= 0) {
        return next(new AppError("Please provide a valid amount greater than 0", 400));
    }

    // Check authorization
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
        return next(new AppError("You are not authorized to credit this wallet", 403));
    }

    // 1. Update user's wallet balance
    const user = await User.findByIdAndUpdate(
        id,
        { $inc: { wallet: amount } },
        { new: true }
    );

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // 2. Create wallet action record
    const walletAction = await walletActions.create({
        user: id,
        amount: amount,
        type: "deposit",
        message: message || "Wallet credit",
        createdAt: Date.now()
    });

    res.status(200).json({
        status: "success",
        data: {
            user: {
                id: user._id,
                wallet: user.wallet
            },
            walletAction
        }
    });
});

exports.debitWallet = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { amount, message } = req.body;

    if (!amount || amount <= 0) {
        return next(new AppError("Please provide a valid amount greater than 0", 400));
    }

    // 1. Check if user has sufficient balance
    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.wallet < amount) {
        return next(new AppError("Insufficient wallet balance", 400));
    }

    // 2. Update user's wallet balance
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $inc: { wallet: -amount } },
        { new: true }
    );

    // 3. Create wallet action record
    const walletAction = await walletActions.create({
        user: id,
        amount: amount,
        type: "withdrawal",
        message: message || "Wallet withdrawal",
        createdAt: Date.now()
    });

    res.status(200).json({
        status: "success",
        data: {
            user: {
                id: updatedUser._id,
                wallet: updatedUser.wallet
            },
            walletAction
        }
    });
});

exports.getWalletHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Check authorization
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
        return next(new AppError("You are not authorized to view this wallet history", 403));
    }

    // Validate user exists
    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get wallet transactions
    const transactions = await walletActions
        .find({ user: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const totalTransactions = await walletActions.countDocuments({ user: id });

    res.status(200).json({
        status: "success",
        results: transactions.length,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: parseInt(page),
        data: {
            user: {
                id: user._id,
                username: user.username,
                wallet: user.wallet
            },
            transactions
        }
    });
});

