const express = require("express");
const fs = require("fs");
const { request } = require("http");
const morgan = require("morgan");

const valorantRouter = require("./routes/valorantRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// 1) Middleware
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // gets the information about the request and logs it to the console e.g GET /valorant/accounts 200 3.000 ms - 43
}
app.use(express.json());

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

module.exports = app;
