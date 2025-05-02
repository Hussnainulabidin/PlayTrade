const Chat = require('../models/chatModel');
const User = require('../models/user');
const Order = require('../models/order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get all chats for a user (either as sender or receiver)
exports.getUserChats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const chats = await Chat.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .populate({
      path: 'sender receiver',
      select: 'name photo username'
    })
    .populate({
      path: 'orderId',
      select: 'orderNumber status'
    })
    .select('-messages')
    .sort('-lastActivity');
  
  res.status(200).json({
    status: 'success',
    results: chats.length,
    data: {
      chats
    }
  });
});

// Get a specific chat by ID with messages
exports.getChat = catchAsync(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user.id;

  console.log("User ID:", userId);
  console.log("User ID type:", typeof userId);
  
  const chat = await Chat.findById(chatId)
    .populate({
      path: 'sender receiver',
      select: 'username photo'
    })
    .populate({
      path: 'orderId',
      select: 'orderNumber status items'
    });
  
  if (!chat) {
    return next(new AppError('No chat found with that ID', 404));
  }

  console.log("test")


  console.log("Chat sender:", chat.sender);
  console.log("Chat sender toString():", chat.sender.toString());
  console.log("Chat receiver:", chat.receiver);
  console.log("Chat receiver toString():", chat.receiver.toString());

  // Check if the user is a participant in this chat
  const senderId = typeof chat.sender === 'object' && chat.sender._id ? chat.sender._id.toString() : chat.sender.toString();
  const receiverId = chat.receiver ? (typeof chat.receiver === 'object' && chat.receiver._id ? chat.receiver._id.toString() : chat.receiver.toString()) : null;
  const userIdStr = userId.toString();
  
  console.log("Comparing IDs:", senderId, receiverId, userIdStr);
  
  if (senderId !== userIdStr && (receiverId === null || receiverId !== userIdStr)) {
    console.log("Authorization check failed for chat");
    return next(new AppError('You are not authorized to access this chat', 403));
  }
  
  // Mark all unread messages from other users as read
  chat.messages.forEach(message => {
    if (!message.read && message.sender.toString() !== userId) {
      message.read = true;
    }
  });
  
  await chat.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    data: {
      chat
    }
  });
});

// Create a new chat
exports.createChat = catchAsync(async (req, res, next) => {
  const { orderId, receiver, initialMessage } = req.body;
  const sender = req.user.id;
  
  // Check if a chat already exists for this order
  const existingChat = await Chat.findOne({ orderId });
  
  if (existingChat) {
    return next(new AppError('A chat for this order already exists', 400));
  }
  
  const messages = [];
  
  // Add initial message if provided
  if (initialMessage) {
    messages.push({
      sender: sender,
      content: initialMessage,
      timestamp: Date.now(),
      read: false
    });
  }
  
  const newChat = await Chat.create({
    sender,
    receiver,
    orderId,
    messages,
    lastActivity: Date.now()
  });
  
  const populatedChat = await Chat.findById(newChat._id)
    .populate({
      path: 'sender receiver',
      select: 'username email photo'
    });
  
  res.status(201).json({
    status: 'success',
    data: {
      chat: populatedChat
    }
  });
});

// Add a message to an existing chat
exports.addMessage = catchAsync(async (req, res, next) => {
  const chatId = req.params.id;
  const { content } = req.body;
  const userId = req.user.id;
  
  const chat = await Chat.findById(chatId);

  
  if (!chat) {
    return next(new AppError('No chat found with that ID', 404));
  }

  // Check if the user is a participant in this chat
  const senderId = typeof chat.sender === 'object' && chat.sender._id ? chat.sender._id.toString() : chat.sender.toString();
  const receiverId = chat.receiver ? (typeof chat.receiver === 'object' && chat.receiver._id ? chat.receiver._id.toString() : chat.receiver.toString()) : null;
  const userIdStr = userId.toString();
  
  console.log("Comparing IDs:", senderId, receiverId, userIdStr);
  
  // Check if the user is an admin, the sender, or if the sender matches the current user
  if (req.user.role !== 'admin' && senderId !== userIdStr) {
    console.log("Authorization check failed for chat");
    return next(new AppError('You are not authorized to add messages to this chat', 403));
  }
  console.log("Authorization check passed for chat");

  
  const newMessage = {
    sender: userId,
    content: content.content,
    timestamp: Date.now(),
    read: false
  };

  chat.messages.push(newMessage);
  chat.lastActivity = Date.now();

  await chat.save();


  // Return only the new message
  const addedMessage = chat.messages[chat.messages.length - 1];
  
  res.status(200).json({
    status: 'success',
    data: {
      message: addedMessage
    }
  });
});

// Get order chat by order ID
exports.getChatByOrderId = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user.id;
  
  console.log("Getting chat for order:", orderId);
  console.log("User ID:", userId);
  
  const chat = await Chat.findOne({ orderId })
    .populate({
      path: 'sender receiver',
      select: 'username email photo'
    });
  
  if (!chat) {
    console.log("No chat found for order:", orderId);
    // If no chat exists, return empty messages array instead of error
    return res.status(200).json({
      status: 'success',
      data: {
        messages: []
      }
    });
  }
  
  console.log("Chat found:");
  console.log("Chat sender:", chat.sender, "toString:", chat.sender.toString());
  console.log("Chat receiver:", chat.receiver, "toString:", chat.receiver.toString());
  console.log("User ID:", userId, "toString:", userId.toString());
  
  // Check if the user is a participant in this chat
  const senderId = typeof chat.sender === 'object' && chat.sender._id ? chat.sender._id.toString() : chat.sender.toString();
  const receiverId = chat.receiver ? (typeof chat.receiver === 'object' && chat.receiver._id ? chat.receiver._id.toString() : chat.receiver.toString()) : null;
  const userIdStr = userId.toString();
  
  console.log("Comparing IDs:", senderId, receiverId, userIdStr);
  
  // Check if the user is an admin or a participant in this chat
  if (req.user.role !== 'admin' && senderId !== userIdStr && (receiverId === null || receiverId !== userIdStr)) {
    console.log("Authorization check failed for order chat");
    return next(new AppError('You are not authorized to access this chat', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      chat,
      messages: chat.messages
    }
  });
});

// Mark all messages in a chat as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user.id;
  
  const chat = await Chat.findById(chatId);
  
  if (!chat) {
    return next(new AppError('No chat found with that ID', 404));
  }
  
  // Check if the user is a participant in this chat
  const senderId = typeof chat.sender === 'object' && chat.sender._id ? chat.sender._id.toString() : chat.sender.toString();
  const receiverId = chat.receiver ? (typeof chat.receiver === 'object' && chat.receiver._id ? chat.receiver._id.toString() : chat.receiver.toString()) : null;
  const userIdStr = userId.toString();
  
  console.log("Comparing IDs:", senderId, receiverId, userIdStr);
  
  // Check if the user is an admin or a participant in this chat
  if (req.user.role !== 'admin' && senderId !== userIdStr && (receiverId === null || receiverId !== userIdStr)) {
    console.log("Authorization check failed for chat");
    return next(new AppError('You are not authorized to access this chat', 403));
  }
  
  // Mark all messages from other users as read
  let updated = false;
  chat.messages.forEach(message => {
    if (!message.read && message.sender.toString() !== userId) {
      message.read = true;
      updated = true;
    }
  });
  
  if (updated) {
    await chat.save({ validateBeforeSave: false });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'All messages marked as read'
  });
});

// Add a message to an order chat
exports.addMessageToOrderChat = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;
  const { content } = req.body;
  const userId = req.user.id;

  console.log("0-------------->Chat messages:");
  
  // Find the chat for this order
  const chat = await Chat.findOne({ orderId });
  
  // If no chat exists, create one
  if (!chat) {
    // Get order details to determine buyer and seller
    const order = await Order.findById(orderId);
    
    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }
    
    // Check if the user is an admin or a participant in this order
    if (req.user.role !== 'admin' && order.clientID.toString() !== userId && order.sellerID.toString() !== userId) {
      return next(new AppError('You are not authorized to access this order', 403));
    }
    
    // Create a new chat
    const newChat = await Chat.create({
      sender: order.sellerID,
      receiver: order.clientID,
      orderId: order._id,
      messages: [{
        sender: userId,
        content,
        timestamp: Date.now(),
        read: false
      }],
      lastActivity: Date.now()
    });
    
    const addedMessage = newChat.messages[0];
    
    return res.status(201).json({
      status: 'success',
      data: {
        message: addedMessage
      }
    });
  }
  
  // Check if the user is a participant in this chat
  const senderId = typeof chat.sender === 'object' && chat.sender._id ? chat.sender._id.toString() : chat.sender.toString();
  const receiverId = chat.receiver ? (typeof chat.receiver === 'object' && chat.receiver._id ? chat.receiver._id.toString() : chat.receiver.toString()) : null;
  const userIdStr = userId.toString();
  
  console.log("Comparing IDs:", senderId, receiverId, userIdStr);
  
  // Check if the user is an admin or a participant in this chat
  if (req.user.role !== 'admin' && senderId !== userIdStr && (receiverId === null || receiverId !== userIdStr)) {
    console.log("Authorization check failed for order chat");
    return next(new AppError('You are not authorized to access this chat', 403));
  }
  
  // Add the message
  const newMessage = {
    sender: userId,
    content,
    timestamp: Date.now(),
    read: false
  };
  
  chat.messages.push(newMessage);
  chat.lastActivity = Date.now();
  
  await chat.save();
  
  
  // Return only the new message
  const addedMessage = chat.messages[chat.messages.length - 1];
  
  res.status(200).json({
    status: 'success',
    data: {
      message: addedMessage
    }
  });
}); 