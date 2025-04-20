const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for user chats
router.get('/my-chats', chatController.getUserChats);
router.post('/', chatController.createChat);

// Routes for specific chat operations
router.get('/:id', chatController.getChat);
router.post('/:id/messages', chatController.addMessage);
router.patch('/:id/read', chatController.markAllAsRead);

// Get chat by order ID
router.get('/order/:orderId', chatController.getChatByOrderId);

// Add message to order chat
router.post('/order/:orderId/messages', chatController.addMessageToOrderChat);

module.exports = router; 