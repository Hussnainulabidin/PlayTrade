const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");


const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);


//admin routes for updating and deleting users
router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
