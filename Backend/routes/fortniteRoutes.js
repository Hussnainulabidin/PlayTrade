const express = require("express");
const fortniteController = require("./../controllers/fortniteController");
const authController = require("./../controllers/authController");

const router = express.Router();

// middleware to check if the id is valid before proceeding to the routes
// router.param("id", fortniteController.checkID);

router
  .route("/")
  .get(fortniteController.getTopAccounts)
  .post(authController.protect, authController.restrictTo("seller"), fortniteController.createAccount);

router
  .route("/accounts")
  .get(fortniteController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(fortniteController.getAccount)
  .patch(authController.protect, authController.restrictTo("seller", "admin"), fortniteController.updateAccount)
  .delete(authController.protect, authController.restrictTo("seller", "admin"), fortniteController.deleteAccount);

module.exports = router; 