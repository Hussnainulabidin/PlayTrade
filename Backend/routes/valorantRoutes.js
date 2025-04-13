const express = require("express");
const valorantController = require("./../controllers/valorantController");
const authController = require("./../controllers/authController");

const router = express.Router();

// middleware to check if the id is valid before proceeding to the routes
// router.param("id",valorantController.checkID);



router
  .route("/")
  .get(valorantController.getTopAccounts)
  .post(authController.protect , authController.restrictTo("seller") , valorantController.createAccount);

router
    .route("/accounts")
    .get(valorantController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(valorantController.getAccount)
  .patch(authController.protect , authController.restrictTo("seller" , "admin") , valorantController.updateAccount)
  .delete(authController.protect , authController.restrictTo("seller" , "admin") ,  valorantController.deleteAccount);

module.exports = router;