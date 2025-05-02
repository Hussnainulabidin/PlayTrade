const express = require("express");
const clashofclansController = require("./../controllers/clashofclansController");
const authController = require("./../controllers/authController");
const upload = require("./../configuration/multer");

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

// Separate route for adding pictures with multer middleware
router
  .route("/accounts/:id/pictures")
  .put(
    authController.protect,
    authController.restrictTo("seller", "admin"),
    upload.array('images', 5), // Allow up to 5 images with field name 'images'
    clashofclansController.addPictures
  );

module.exports = router; 