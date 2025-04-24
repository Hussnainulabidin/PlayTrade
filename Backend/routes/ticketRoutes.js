const express = require('express');
const ticketController = require('../controllers/ticketController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Create ticket - allow any authenticated user (client or seller)
router.post('/', ticketController.createTicket);

// Get tickets by client - allow clients to view their own tickets
router.get('/client/:clientId', authController.restrictTo('admin', 'user'), ticketController.getTicketsByClient);

// Admin and seller only routes for the rest
router.use(authController.restrictTo('admin', 'seller'));

// Get all tickets with filtering
router.get('/', ticketController.getAllTickets);

// Get tickets by admin
router.get('/admin/:adminId', ticketController.getTicketsByAdmin);

// Get tickets by seller
router.get('/seller/:sellerId', ticketController.getTicketsBySeller);

// Get single ticket
router.get('/:id', ticketController.getTicket);

// Update ticket status
router.patch('/:id/status', ticketController.updateTicketStatus);

// Join ticket as admin
router.post('/:id/join', ticketController.joinTicket);

// Reassign ticket
router.patch('/:id/reassign', ticketController.reassignTicket);

module.exports = router; 