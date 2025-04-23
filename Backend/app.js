const express = require("express");
const fs = require("fs");
const { request } = require("http");
const morgan = require("morgan");
const cors = require("cors")

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
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
});

app.use(globalErrorHandler);

module.exports = app;
