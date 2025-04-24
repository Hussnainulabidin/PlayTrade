const express = require("express");
const authController = require("./../controllers/authController");
const gameAccountsController = require("./../controllers/gameAccountsController");

const router = express.Router();

router.route("/seller/:id").get(
  authController.protect,
  authController.restrictTo("admin", "seller"),
  gameAccountsController.getAccountsBySellerId
);

router.route("/update-status")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    gameAccountsController.updateAccountStatus
  );

router.route("/delete-account")
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    gameAccountsController.deleteAccount
  );

module.exports = router;
