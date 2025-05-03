const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get game account model based on game type
const getGameAccountModel = (gameType) => {
  switch(gameType.toLowerCase()) {
    case 'valorant':
      return require('../models/valorant');
    case 'fortnite':
      return require('../models/fortnite');
    case 'leagueoflegends':
      return require('../models/leagueoflegends');
    case 'clashofclans':
      return require('../models/clashofclans');
    case 'brawlstars':
      return require('../models/brawlstars');
    default:
      throw new Error('Invalid game type');
  }
};

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  console.log("Creating payment intent with body:", req.body);

  const { accountId, gameType } = req.body;
  
  if (!accountId || !gameType) {
    return next(new AppError('Please provide account ID and game type', 400));
  }
  
  try {
    // Get the game account model based on the game type
    const GameAccount = getGameAccountModel(gameType);
    
    // Find the account details
    const account = await GameAccount.findById(accountId);
    console.log("Found account:", account);
    
    if (!account) {
      return next(new AppError('Account not found', 404));
    }
    
    // Calculate price with processing fee (5%)
    const basePrice = account.price;
    const processingFee = basePrice * 0.05;
    const totalAmount = Math.round((basePrice + processingFee) * 100); // Convert to cents for Stripe
    
    console.log(`Creating payment intent for ${totalAmount} cents`);
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        accountId,
        gameType,
        userId: req.user.id
      },
      // Use only automatic_payment_methods - remove payment_method_types
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount / 100,
        basePrice,
        processingFee: processingFee
      }
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return next(new AppError(`Error creating payment intent: ${error.message}`, 500));
  }
});

exports.getPaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentIntentId } = req.params;
  
  if (!paymentIntentId) {
    return next(new AppError('Please provide payment intent ID', 400));
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.status(200).json({
      status: 'success',
      data: {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    return next(new AppError(`Error getting payment status: ${error.message}`, 500));
  }
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Extract metadata
    const { accountId, gameType, userId } = paymentIntent.metadata;
    
    // Create an order
    const newOrder = await Order.create({
      accountID: accountId,
      gameType,
      userID: userId,
      paymentIntentId: paymentIntent.id,
      status: 'paid',
      paymentDate: new Date(),
      amount: paymentIntent.amount / 100,
    });
    
    // Update the game account status to sold if needed
    try {
      const GameAccount = getGameAccountModel(gameType);
      await GameAccount.findByIdAndUpdate(accountId, { status: 'sold' });
    } catch (error) {
      console.error(`Error updating account status: ${error.message}`);
    }
  }
  
  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}); 