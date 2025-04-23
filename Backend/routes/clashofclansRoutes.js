const express = require("express");
const clashofclansController = require("./../controllers/clashofclansController");
const authController = require("./../controllers/authController");

const router = express.Router();

// middleware to check if the id is valid before proceeding to the routes
// router.param("id", clashofclansController.checkID);

router
  .route("/")
  .get(clashofclansController.getTopAccounts)
  .post(authController.protect, authController.restrictTo("seller"), clashofclansController.createAccount);

router
  .route("/accounts")
  .get(clashofclansController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(clashofclansController.getAccount)
  .patch(authController.protect, authController.restrictTo("seller", "admin"), clashofclansController.updateAccount)
  .delete(authController.protect, authController.restrictTo("seller", "admin"), clashofclansController.deleteAccount);

module.exports = router; 