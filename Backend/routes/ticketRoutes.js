const express = require('express');
const ticketController = require('../controllers/ticketController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Admin only routes
router.use(authController.restrictTo('admin' , 'seller'));

// Create ticket
router.post('/', ticketController.createTicket);

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