const express = require("express");
const valorantController = require("./../controllers/valorantController");

const router = express.Router();

// middleware to check if the id is valid before proceeding to the routes
router.param("id",valorantController.checkID);



router
  .route("/")
  .get(valorantController.getTopAccounts)
  .post(valorantController.checkBody,valorantController.createAccount);

router
    .route("/accounts")
    .get(valorantController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(valorantController.getAccount)
  .patch(valorantController.updateAccount)
  .delete(valorantController.deleteAccount);

module.exports = router;