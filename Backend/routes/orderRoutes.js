const express = require("express");
const authController = require("./../controllers/authController");
const orderController = require("./../controllers/orderController");

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Get orders by seller ID - restricted to admin and the seller themselves
router.route("/seller/:id").get(authController.restrictTo("admin" , "seller"),orderController.getOrdersBySellerId);

// Create a new order - any authenticated user can create an order
router.route("/").post(orderController.createOrder);
router.route("/").get(authController.restrictTo("admin"),orderController.getAllOrders);

// Get specific order by ID - any authenticated user can access if they are buyer or seller
router.route("/myorder/:id").get(orderController.getOrderById);

router.route("/:id/mark-received").post(orderController.markOrderAsReceived);

// Create chat for an existing order - restricted to admin and seller
router.route("/:id/create-chat").post(
  authController.restrictTo("admin", "seller"),
  orderController.createChatForOrder
);

module.exports = router;
