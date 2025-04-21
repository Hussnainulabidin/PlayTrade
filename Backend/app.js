const express = require("express");
const fs = require("fs");
const { request } = require("http");
const morgan = require("morgan");
const cors = require("cors")

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const valorantRouter = require("./routes/valorantRoutes");
const userRouter = require("./routes/userRoutes");
const gameAccountsRouter = require("./routes/gameAccounts");
const walletRouter = require("./routes/walletRoutes");
const orderRouter = require("./routes/orderRoutes");


const app = express();

// 1) Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // gets the information about the request and logs it to the console e.g GET /valorant/accounts 200 3.000 ms - 43
}
app.use(express.json());
app.use(cors())

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) Routes
app.use("/valorant", valorantRouter);
app.use("/users", userRouter);
app.use("/gameAccounts", gameAccountsRouter);
app.use("/wallet", walletRouter);
app.use("/orders", orderRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
});

app.use(globalErrorHandler);

module.exports = app;
