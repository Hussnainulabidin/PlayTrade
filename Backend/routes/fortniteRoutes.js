const express = require("express");
const fortniteController = require("./../controllers/fortniteController");
const authController = require("./../controllers/authController");
const upload = require("./../configuration/multer");

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

// Separate route for adding pictures with multer middleware
router
  .route("/accounts/:id/pictures")
  .put(
    authController.protect,
    authController.restrictTo("seller", "admin"),
    upload.array('images', 5), // Allow up to 5 images with field name 'images'
    fortniteController.addPictures
  );

module.exports = router; 