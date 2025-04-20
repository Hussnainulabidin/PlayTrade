const express = require("express");
const walletController = require("../controllers/walletController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all wallet routes
router.use(authController.protect);

// Credit and debit wallet routes
router.post("/credit/:id",authController.restrictTo("admin" , "seller"), walletController.creditWallet);
router.post("/debit/:id",authController.restrictTo("admin" , "seller"), walletController.debitWallet);

// Get wallet history
router.get("/history/:id", authController.restrictTo("admin" , "seller"), walletController.getWalletHistory);

module.exports = router;
