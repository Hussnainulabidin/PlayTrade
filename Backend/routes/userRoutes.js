const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");



const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


//admin routes for updating and deleting users
router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route("/me").get(authController.protect, userController.myData)

router.route("/getSeller").get(authController.protect, authController.restrictTo("admin"), userController.getAllSellers)

router.route("/getSeller/:id").get(authController.protect, authController.restrictTo("admin"), userController.getSeller)

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);



module.exports = router;
