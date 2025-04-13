const valorant = require("./../models/valorant");
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAccountsBySellerId = catchAsync(async (req, res, next) => {
    const sellerId = req.params.id;
    console.log("sellerId -> " , sellerId)
    
    if (!sellerId) {
        return next(new AppError('Seller ID is required', 400));
    }
    
    const accounts = await valorant.find({ 
        sellerID: sellerId,
        status: { $ne: "sold" }
    });
    
    if (!accounts || accounts.length === 0) {
        return res.status(200).json({
            status: "success",
            results: 0,
            data: { gameAccounts: [] }
        });
    }
    
    const gameAccounts = accounts.map(account => ({
        gameType: "Valorant",
        ...account._doc
    }));
    
    res.status(200).json({
        status: "success",
        results: gameAccounts.length,
        data: { gameAccounts }
    });
});
