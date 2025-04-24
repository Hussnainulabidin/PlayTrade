const Ticket = require('../models/ticketModel');
const Chat = require('../models/chatModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require("../models/user")

// Create a new ticket
exports.createTicket = catchAsync(async (req, res, next) => {
  const { ticketType } = req.body;
  const userId = req.user._id; // Get user ID from authenticated user

  console.log(ticketType);

  // Create the ticket
  const ticket = await Ticket.create({
    sellerId: userId, // Use userId for both sellers and clients
    ticketType: ticketType
  });

  // Create a new chat for the ticket with the ticketId
  const newChat = await Chat.create({
    sender: userId,
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
  const { filter, userType } = req.query;
  const adminId = req.user._id;

  let query = Ticket.find();

  // Apply filters based on the filter parameter
  if (filter === 'mytickets') {
    query = query.where('assignedAdmin').equals(adminId);
  } else if (filter === 'unattended') {
    query = query.where('assignedAdmin').equals(null);
  } else if (filter === 'client') {
    query = query.where('ticketType').equals('Client Ticket');
  } else if (filter === 'seller') {
    query = query.where('ticketType').ne('Client Ticket');
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

  // Add a creatorType field to each ticket for easier frontend processing
  const ticketsWithCreatorType = tickets.map(ticket => {
    const ticketObj = ticket.toObject();
    ticketObj.creatorType = ticket.ticketType === 'Client Ticket' ? 'client' : 'seller';
    return ticketObj;
  });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets: ticketsWithCreatorType
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
  const ticketId = req.params.id;
  const userId = req.user._id;
  
  // Validate status
  if (!['Open', 'In Progress', 'Closed'].includes(status)) {
    return next(new AppError('Invalid status. Must be one of: Open, In Progress, Closed', 400));
  }
  
  // Get the ticket with its current status
  const ticket = await Ticket.findById(ticketId);
  
  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }
  
  const previousStatus = ticket.status;
  
  // Update the ticket status
  ticket.status = status;
  ticket.lastActivity = Date.now();
  await ticket.save();
  
  // Get user info for notification
  const user = await User.findById(userId).select('username role');
  
  // If the ticket has a chat and status changed to Closed or from Closed to Open, add a system message
  if (ticket.chatId && (status === 'Closed' || (previousStatus === 'Closed' && status === 'Open'))) {
    try {
      const chat = await Chat.findById(ticket.chatId);
      
      if (chat) {
        // Add system message about status change
        const actionText = status === 'Closed' ? 'closed' : 'reopened';
        const systemMessage = {
          sender: userId, // The user who changed the status
          content: `Ticket has been ${actionText} by ${user ? user.username : 'a support agent'}.`,
          timestamp: Date.now(),
          isSystemMessage: true,
          read: true
        };
        
        chat.messages.push(systemMessage);
        chat.lastActivity = Date.now();
        await chat.save();
        
        console.log(`System message added to chat ${chat._id} for ticket ${ticketId}: Status changed to ${status}`);
      }
    } catch (chatError) {
      console.error('Error adding system message to chat:', chatError);
      // We don't fail the main operation if adding a chat message fails
    }
  }
  
  console.log(`Ticket ${ticketId} status updated from ${previousStatus} to ${status} by user ${userId}`);
  
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
  const userId = req.params.sellerId;
  const tickets = await Ticket.find({ sellerId: userId })
    .populate('chatId')
    .populate('assignedAdmin', 'name email username')
    .sort('-lastActivity');

  // Determine if each ticket is from a client or seller
  const ticketsWithType = tickets.map(ticket => {
    const ticketObj = ticket.toObject();
    ticketObj.creatorType = ticket.ticketType === 'Client Ticket' ? 'client' : 'seller';
    return ticketObj;
  });

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets: ticketsWithType
    }
  });
});

// Add a more explicit function for getting tickets by client ID
exports.getTicketsByClient = catchAsync(async (req, res, next) => {
  const clientId = req.params.clientId;
  const tickets = await Ticket.find({ 
    sellerId: clientId,
    ticketType: 'Client Ticket'
  })
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