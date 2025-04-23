const express = require("express");
const brawlstarsController = require("./../controllers/brawlstarsController");
const authController = require("./../controllers/authController");

const router = express.Router();

// middleware to check if the id is valid before proceeding to the routes
// router.param("id", brawlstarsController.checkID);

router
  .route("/")
  .get(brawlstarsController.getTopAccounts)
  .post(authController.protect, authController.restrictTo("seller"), brawlstarsController.createAccount);

router
  .route("/accounts")
  .get(brawlstarsController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(brawlstarsController.getAccount)
  .patch(authController.protect, authController.restrictTo("seller", "admin"), brawlstarsController.updateAccount)
  .delete(authController.protect, authController.restrictTo("seller", "admin"), brawlstarsController.deleteAccount);

module.exports = router; 