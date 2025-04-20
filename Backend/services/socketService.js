const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Chat = require('../models/chatModel');
const Order = require('../models/order');

// Store active connections
const activeUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["my-custom-header", "Access-Control-Allow-Origin"]
    },
    transports: ['polling', 'websocket']
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found or inactive'));
      }
      
      // Attach user data to socket
      socket.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };
      
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Store user connection
    activeUsers.set(socket.user.id.toString(), socket.id);
    
    // Join user to their private room
    socket.join(socket.user.id.toString());
    
    // Emit user online status to interested parties
    io.emit('userStatus', {
      userId: socket.user.id,
      status: 'online'
    });

    // Handle joining a chat room
    socket.on('joinChat', async (chatIdOrOrderId) => {
      try {
        // Find the chat - first try by direct ID
        let chat = await Chat.findById(chatIdOrOrderId);
        
        // If not found, try by order ID
        if (!chat) {
          chat = await Chat.findOne({ orderId: chatIdOrOrderId });
          
          // If still not found, try to find the order and create a chat
          if (!chat) {
            const order = await Order.findById(chatIdOrOrderId);
            
            if (!order) {
              socket.emit('error', { message: 'Order not found' });
              return;
            }
            
            // Check if user is admin or participant in the order
            if (socket.user.role !== 'admin' && 
                order.clientID.toString() !== socket.user.id.toString() && 
                order.sellerID.toString() !== socket.user.id.toString()) {
              socket.emit('error', { message: 'Not authorized to join chat for this order' });
              return;
            }
            
            // Create a new chat for this order
            chat = await Chat.create({
              sender: order.sellerID,
              receiver: order.clientID,
              orderId: order._id,
              messages: [],
              lastActivity: Date.now()
            });
          }
        }
        
        // Check if user is admin or participant in the chat
        if (socket.user.role !== 'admin' && 
            chat.sender.toString() !== socket.user.id.toString() && 
            chat.receiver.toString() !== socket.user.id.toString()) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }
        
        const roomId = `chat:${chat._id}`;
        // Join the chat room
        socket.join(roomId);
        
        // Notify other participants that user joined
        socket.to(roomId).emit('userJoined', {
          chatId: chat._id,
          userId: socket.user.id,
          userName: socket.user.username
        });
        
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle leaving a chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // Handle sending a new message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content } = data;
        
        // Find the chat
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is admin or participant in the chat
        if (socket.user.role !== 'admin' && 
            chat.sender.toString() !== socket.user.id.toString() && 
            chat.receiver.toString() !== socket.user.id.toString()) {
          socket.emit('error', { message: 'Not authorized to send messages to this chat' });
          return;
        }
        
        // Create new message
        const newMessage = {
          sender: socket.user.id,
          content,
          timestamp: Date.now(),
          read: false
        };
        
        // Add message to chat
        chat.messages.push(newMessage);
        chat.lastActivity = Date.now();
        
        await chat.save();
        
        // Get the created message
        const addedMessage = chat.messages[chat.messages.length - 1];
        
        // Send the message to all users in the chat room
        io.to(`chat:${chatId}`).emit('newMessage', {
          chatId,
          message: {
            ...addedMessage.toObject(),
            sender: {
              _id: socket.user.id,
              username: socket.user.username
            }
          }
        });
        
        // Send notification to the recipient
        const recipientId = chat.sender.toString() === socket.user.id.toString() ? 
          chat.receiver.toString() : chat.sender.toString();
        
        // If recipient is online, send notification to their personal room
        if (activeUsers.has(recipientId)) {
          io.to(recipientId).emit('chatNotification', {
            type: 'newMessage',
            chatId,
            message: 'New message received',
            sender: socket.user.username,
            timestamp: newMessage.timestamp
          });
        }
        
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      
      socket.to(`chat:${chatId}`).emit('userTyping', {
        chatId,
        userId: socket.user.id,
        userName: socket.user.username,
        isTyping
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { chatId } = data;
        
        // Find the chat
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is admin or participant in the chat
        if (socket.user.role !== 'admin' && 
            chat.sender.toString() !== socket.user.id.toString() && 
            chat.receiver.toString() !== socket.user.id.toString()) {
          socket.emit('error', { message: 'Not authorized to access this chat' });
          return;
        }
        
        // Mark messages as read
        let updated = false;
        chat.messages.forEach(message => {
          if (!message.read && message.sender.toString() !== socket.user.id.toString()) {
            message.read = true;
            updated = true;
          }
        });
        
        if (updated) {
          await chat.save();
          
          // Notify other users in the chat that messages were read
          io.to(`chat:${chatId}`).emit('messagesRead', {
            chatId,
            userId: socket.user.id
          });
        }
        
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      
      // Remove user from active users
      activeUsers.delete(socket.user.id.toString());
      
      // Emit user offline status
      io.emit('userStatus', {
        userId: socket.user.id,
        status: 'offline'
      });
    });
  });

  return io;
};

module.exports = initializeSocket; 