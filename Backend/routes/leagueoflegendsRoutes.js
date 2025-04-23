const express = require("express");
const leagueoflegendsController = require("./../controllers/leagueoflegendsController");
const authController = require("./../controllers/authController");

const router = express.Router();

// middleware to check if the id is valid before proceeding to the routes
// router.param("id", leagueoflegendsController.checkID);

router
  .route("/")
  .get(leagueoflegendsController.getTopAccounts)
  .post(authController.protect, authController.restrictTo("seller"), leagueoflegendsController.createAccount);

router
  .route("/accounts")
  .get(leagueoflegendsController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(leagueoflegendsController.getAccount)
  .patch(authController.protect, authController.restrictTo("seller", "admin"), leagueoflegendsController.updateAccount)
  .delete(authController.protect, authController.restrictTo("seller", "admin"), leagueoflegendsController.deleteAccount);

module.exports = router; 