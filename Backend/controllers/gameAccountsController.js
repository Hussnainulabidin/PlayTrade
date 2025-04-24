const valorant = require("./../models/valorant");
const clashofclans = require("./../models/clashofclans");
const leagueoflegends = require("./../models/leagueoflegends");
const fortnite = require("./../models/fortnite");
const brawlstars = require("./../models/brawlstars");
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAccountsBySellerId = catchAsync(async (req, res, next) => {
    const sellerId = req.params.id;
    console.log("sellerId -> " , sellerId)
    
    if (!sellerId) {
        return next(new AppError('Seller ID is required', 400));
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Get Valorant accounts
    const valorantAccounts = await valorant.find({ 
        sellerID: sellerId,
        status: { $ne: "sold" }
    });
    
    // Get Clash of Clans accounts
    const clashAccounts = await clashofclans.find({
        sellerID: sellerId,
        status: { $ne: "sold" }
    });
    
    // Get League of Legends accounts
    const lolAccounts = await leagueoflegends.find({
        sellerID: sellerId,
        status: { $ne: "sold" }
    });
    
    // Get Fortnite accounts
    const fortniteAccounts = await fortnite.find({
        sellerID: sellerId,
        status: { $ne: "sold" }
    });
    
    // Get Brawl Stars accounts
    const brawlstarsAccounts = await brawlstars.find({
        sellerID: sellerId,
        status: { $ne: "sold" }
    });
    
    if ((!valorantAccounts || valorantAccounts.length === 0) && 
        (!clashAccounts || clashAccounts.length === 0) &&
        (!lolAccounts || lolAccounts.length === 0) &&
        (!fortniteAccounts || fortniteAccounts.length === 0) &&
        (!brawlstarsAccounts || brawlstarsAccounts.length === 0)) {
        return res.status(200).json({
            status: "success",
            results: 0,
            data: { gameAccounts: [] }
        });
    }
    
    // Map Valorant accounts
    const valorantGameAccounts = valorantAccounts.map(account => ({
        gameType: "Valorant",
        ...account._doc
    }));
    
    // Map Clash of Clans accounts
    const clashGameAccounts = clashAccounts.map(account => ({
        gameType: "Clash of Clans",
        ...account._doc
    }));
    
    // Map League of Legends accounts
    const lolGameAccounts = lolAccounts.map(account => ({
        gameType: "League of Legends",
        ...account._doc
    }));
    
    // Map Fortnite accounts
    const fortniteGameAccounts = fortniteAccounts.map(account => ({
        gameType: "Fortnite",
        ...account._doc
    }));
    
    // Map Brawl Stars accounts
    const brawlstarsGameAccounts = brawlstarsAccounts.map(account => ({
        gameType: "Brawl Stars",
        ...account._doc
    }));
    
    // Combine all types of accounts
    const allGameAccounts = [
        ...valorantGameAccounts, 
        ...clashGameAccounts, 
        ...lolGameAccounts, 
        ...fortniteGameAccounts,
        ...brawlstarsGameAccounts
    ];
    
    // Calculate total pages
    const totalAccounts = allGameAccounts.length;
    const totalPages = Math.ceil(totalAccounts / limit);
    
    // Apply pagination to combined accounts
    const gameAccounts = allGameAccounts.slice(skip, skip + limit);
    
    res.status(200).json({
        status: "success",
        results: gameAccounts.length,
        totalAccounts,
        totalPages,
        currentPage: page,
        data: { gameAccounts }
    });
});

exports.updateAccountStatus = catchAsync(async (req, res, next) => {
    const { accountId, gameType, status } = req.body;
    
    if (!accountId || !gameType || !status) {
        return next(new AppError('Account ID, game type, and status are required', 400));
    }
    
    // Validate status value
    const validStatuses = ['active', 'draft', 'sold'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid status. Must be one of: active, draft, sold', 400));
    }
    
    let model;
    
    // Select the appropriate model based on game type
    switch(gameType.toLowerCase()) {
        case 'valorant':
            model = valorant;
            break;
        case 'clash of clans':
            model = clashofclans;
            break;
        case 'league of legends':
            model = leagueoflegends;
            break;
        case 'fortnite':
            model = fortnite;
            break;
        case 'brawl stars':
            model = brawlstars;
            break;
        default:
            return next(new AppError('Invalid game type', 400));
    }
    
    // Update the account status
    const updatedAccount = await model.findByIdAndUpdate(
        accountId,
        { status },
        { new: true, runValidators: true }
    );
    
    if (!updatedAccount) {
        return next(new AppError('No account found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            account: {
                ...updatedAccount._doc,
                gameType
            }
        }
    });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
    const { accountId, gameType } = req.body;
    
    if (!accountId || !gameType) {
        return next(new AppError('Account ID and game type are required', 400));
    }
    
    let model;
    
    // Select the appropriate model based on game type
    switch(gameType.toLowerCase()) {
        case 'valorant':
            model = valorant;
            break;
        case 'clash of clans':
            model = clashofclans;
            break;
        case 'league of legends':
            model = leagueoflegends;
            break;
        case 'fortnite':
            model = fortnite;
            break;
        case 'brawl stars':
            model = brawlstars;
            break;
        default:
            return next(new AppError('Invalid game type', 400));
    }
    
    // Delete the account
    const deletedAccount = await model.findByIdAndDelete(accountId);
    
    if (!deletedAccount) {
        return next(new AppError('No account found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        message: 'Account successfully deleted'
    });
});
