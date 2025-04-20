const Ticket = require('../models/ticketModel');
const Chat = require('../models/chatModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require("../models/user")

// Create a new ticket
exports.createTicket = catchAsync(async (req, res, next) => {
  const { ticketType } = req.body;
  const sellerId = req.user._id; // Get seller ID from authenticated user

  console.log(ticketType);

  // Create the ticket first
  const ticket = await Ticket.create({
    sellerId : sellerId,
    ticketType : ticketType
  });

  // Create a new chat for the ticket with the ticketId
  const newChat = await Chat.create({
    sender: sellerId,
    receiver: null, // Will be set when admin is assigned
    ticketId: ticket._id, // Set the ticketId in the chat
    messages: [],
    isActive: true
  });

  // Update the ticket with the chatId
  ticket.chatId = newChat._id;
  await ticket.save();

  res.status(201).json({
    status: 'success',
    data: {
      ticket,
      chat: newChat
    }
  });
});

// Get all tickets with filtering options
exports.getAllTickets = catchAsync(async (req, res, next) => {
  const { filter } = req.query;
  const adminId = req.user._id;

  let query = Ticket.find();

  // Apply filters based on the filter parameter
  if (filter === 'mytickets') {
    query = query.where('assignedAdmin').equals(adminId);
  } else if (filter === 'unattended') {
    query = query.where('assignedAdmin').equals(null);
  }

  const tickets = await query
    .populate('chatId')
    .populate({
      path: 'sellerId',
      select: 'username name email'
    })
    .populate({
      path: 'assignedAdmin',
      select: 'username name email'
    })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets
    }
  });
});

// Get a single ticket
exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('chatId')
    .populate('sellerId', 'name email username')
    .populate('assignedAdmin', 'name email username');

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Update ticket status
exports.updateTicketStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Reassign ticket to another admin
exports.reassignTicket = catchAsync(async (req, res, next) => {
  const { assignedAdmin } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { assignedAdmin },
    {
      new: true,
      runValidators: true
    }
  );

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});

// Get tickets by admin
exports.getTicketsByAdmin = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ assignedAdmin: req.params.adminId })
    .populate('chatId')
    .populate('sellerId', 'name email username')
    .sort('-lastActivity');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets
    }
  });
});

// Get tickets by seller
exports.getTicketsBySeller = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ sellerId: req.params.sellerId })
    .populate('chatId')
    .populate('assignedAdmin', 'name email username')
    .sort('-lastActivity');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets
    }
  });
});

// Join ticket as admin
exports.joinTicket = catchAsync(async (req, res, next) => {
  const ticketId = req.params.id;
  const adminId = req.user._id;

  // Find the ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  // Check if ticket is already assigned
  if (ticket.assignedAdmin) {
    return next(new AppError('Ticket is already assigned to an admin', 400));
  }

  // Update ticket with assigned admin
  ticket.assignedAdmin = adminId;
  await ticket.save();

  // Update chat receiver
  const chat = await Chat.findById(ticket.chatId);
  if (chat) {
    chat.receiver = adminId;
    await chat.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
}); 