const express = require("express");
const authController = require("./../controllers/authController");
const orderController = require("./../controllers/orderController");

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Get current user's orders
router.route("/my-orders").get(orderController.getMyOrders);

// Get orders by seller ID - restricted to admin and the seller themselves
router.route("/seller/:id").get(authController.restrictTo("admin" , "seller"),orderController.getOrdersBySellerId);

// Create a new order - any authenticated user can create an order
router.route("/").post(orderController.createOrder);
router.route("/").get(authController.restrictTo("admin"),orderController.getAllOrders);

// Get all disputed orders - admin only
router.route("/disputed").get(
  authController.restrictTo("admin"),
  orderController.getDisputedOrders
);

// Get specific order by ID - any authenticated user can access if they are buyer or seller
router.route("/myorder/:id").get(orderController.getOrderById);

// Mark order as received
router.route("/:id/mark-received").post(orderController.markOrderAsReceived);

// Cancel an order - restricted to the seller who owns the order
router.route("/:id/cancel").post(orderController.cancelOrder);

// Dispute an order - for buyers to report issues
router.route("/:id/dispute").post(orderController.disputeOrder);

// Close a dispute - for buyers to close a dispute and mark order as received
router.route("/:id/close-dispute").post(orderController.closeDispute);

// Resolve a dispute (admin only) - approve or refund
router.route("/:id/resolve-dispute").post(
  authController.restrictTo("admin"),
  orderController.resolveDispute
);

// Refund an order - restricted to admin only
router.route("/:id/refund")
  .post(
    authController.restrictTo("admin" , "seller"),
    orderController.refundOrder
  );

// Create chat for an existing order - restricted to admin and seller
router.route("/:id/create-chat").post(
  authController.restrictTo("admin", "seller"),
  orderController.createChatForOrder
);

/**
 * @route   POST /orders/:id/feedback
 * @desc    Submit feedback for an order
 * @access  Private (authenticated client only)
 */
router.post('/:id/feedback', orderController.submitFeedback);

module.exports = router;
