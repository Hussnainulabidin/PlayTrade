const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");



const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes (require authentication)
router.use(authController.protect);

router.post('/update-password', authController.updatePassword);
router.post('/toggle-2fa', authController.toggleTwoFactorAuth);
router.post('/profile-picture', userController.uploadProfilePicture);
router.post('/logout-all', authController.logoutAllSessions);

router.route("/me").get(userController.myData);

// Admin routes
router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers).post(userController.createUser);

router.route("/getSeller").get(userController.getAllSellers);

router.route("/getSeller/:id").get(userController.getSeller);

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);



module.exports = router;
