const express = require("express");
const fs = require("fs");
const { request } = require("http");
const morgan = require("morgan");
const cors = require("cors")
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const valorantRouter = require("./routes/valorantRoutes");
const clashofclansRouter = require("./routes/clashofclansRoutes");
const leagueoflegendsRouter = require("./routes/leagueoflegendsRoutes");
const fortniteRouter = require("./routes/fortniteRoutes");
const brawlstarsRouter = require("./routes/brawlstarsRoutes");
const userRouter = require("./routes/userRoutes");
const gameAccountsRouter = require("./routes/gameAccounts");
const walletRouter = require("./routes/walletRoutes");
const orderRouter = require("./routes/orderRoutes");
const chatRouter = require("./routes/chatRoutes");
const ticketRouter = require('./routes/ticketRoutes');
const stripeRouter = require('./routes/stripeRoutes');


const app = express();

// 1) Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // gets the information about the request and logs it to the console e.g GET /valorant/accounts 200 3.000 ms - 43
}
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'https://playtrade-production.up.railway.app',
    'https://playtrade.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet()); // protects against well known web vulnerabilities by setting HTTP headers appropriately
app.use(mongoSanitize()); // protects against NoSQL query injection

// Sanitize data against XSS
app.use(helmet.contentSecurityPolicy({ // prevents attackers from injecting malicious scripts into the web page
  directives: {
    defaultSrc: ["'self'"], // allows only the current origin to load resources
    scriptSrc: ["'self'", "'unsafe-inline'"], // allows inline scripts and unsafe-inline to be used
    styleSrc: ["'self'", "'unsafe-inline'"], // allows inline styles and unsafe-inline to be used
    imgSrc: ["'self'", "data:", "*.cloudinary.com"] // allows images from the current origin and data URLs and Cloudinary images
  }
}));

// Limit requests from same API
const limiter = rateLimit({ 
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/test" , function(req , res){
  res.send("Hello from the middleware 👋");
})

// 2) Routes
app.use("/valorant", valorantRouter);
app.use("/clashofclans", clashofclansRouter);
app.use("/leagueoflegends", leagueoflegendsRouter);
app.use("/fortnite", fortniteRouter);
app.use("/brawlstars", brawlstarsRouter);
app.use("/users", userRouter);
app.use("/gameAccounts", gameAccountsRouter);
app.use("/wallet", walletRouter);
app.use("/orders", orderRouter);
app.use("/chats", chatRouter);
app.use("/tickets", ticketRouter);
app.use("/payments", stripeRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
});

app.use(globalErrorHandler);

module.exports = app;
