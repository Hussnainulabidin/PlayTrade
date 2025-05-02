import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3003';

let socket = null;
let activeChats = new Set();
let listeners = new Map();

// Initialize and connect to socket server
const initializeSocket = () => {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Cannot connect to socket: token is missing');
    return null;
  }

  try {
    socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Set up basic event handlers
    socket.on('connect', () => {
      console.log('Socket connected: ', socket.id);
      
      // Rejoin active chats after reconnection
      activeChats.forEach(chatId => {
        socket.emit('joinChat', chatId);
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return socket;
  } catch (err) {
    console.error('Error initializing socket:', err);
    return null;
  }
};

// Clean up socket connection
const disconnectSocket = () => {
  if (socket) {
    // Leave all active chats
    activeChats.forEach(chatId => {
      socket.emit('leaveChat', chatId);
    });
    
    // Clear event listeners
    listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.off(event, callback);
      });
    });
    
    listeners.clear();
    activeChats.clear();
    
    // Disconnect
    socket.disconnect();
    socket = null;
  }
};

// Join a chat channel
const joinChat = (chatId) => {
  if (!socket || !socket.connected) {
    initializeSocket();
  }
  
  if (socket && chatId) {
    socket.emit('joinChat', chatId);
    activeChats.add(chatId);
  }
};

// Leave a chat channel
const leaveChat = (chatId) => {
  if (socket && socket.connected && chatId) {
    socket.emit('leaveChat', chatId);
    activeChats.delete(chatId);
  }
};

// Send a chat message
const sendMessage = (chatId, content) => {
  if (!socket || !socket.connected) {
    console.error('Cannot send message: socket not connected');
    return false;
  }
  
  if (!chatId || !content?.trim()) {
    console.error('Cannot send message: missing chatId or content');
    return false;
  }
  
  socket.emit('sendMessage', {
    chatId,
    content
  });
  
  return true;
};

// Send typing status
const sendTypingStatus = (chatId, isTyping) => {
  if (socket && socket.connected && chatId) {
    socket.emit('typing', {
      chatId,
      isTyping
    });
  }
};

// Register event listener with duplicate prevention
const on = (event, callback) => {
  if (!socket) {
    initializeSocket();
  }
  
  if (socket) {
    // Store reference to callback for cleanup
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    
    // Register the event listener
    socket.on(event, callback);
  }
};

// Remove event listener
const off = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
    
    // Remove from our tracking
    if (listeners.has(event)) {
      listeners.get(event).delete(callback);
    }
  }
};

// Check if socket is connected
const isConnected = () => {
  return socket && socket.connected;
};

// Get current socket instance
const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Export the service
const socketService = {
  initializeSocket,
  disconnectSocket,
  joinChat,
  leaveChat,
  sendMessage,
  sendTypingStatus,
  on,
  off,
  isConnected,
  getSocket
};

export default socketService; 