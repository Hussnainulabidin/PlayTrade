const express = require("express");
const authController = require("./../controllers/authController");
const gameAccountsController = require("./../controllers/gameAccountsController");

const router = express.Router();

router.route("/seller/:id").get(
  authController.protect,
  authController.restrictTo("admin" , "seller"),
  gameAccountsController.getAccountsBySellerId
);

module.exports = router;
