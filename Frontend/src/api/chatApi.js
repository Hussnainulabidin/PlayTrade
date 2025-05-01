import API from './index';

const chatApi = {
  // Chat management
  getMyChats: () => API.get('/chats/my-chats'),
  getChatById: (chatId) => API.get(`/chats/${chatId}`),
  
  // Messages
  sendMessage: (chatId, messageData) => API.post(`/chats/${chatId}/messages`, messageData),
  markAsRead: (chatId) => API.patch(`/chats/${chatId}/read`),
  
  // For future socket integration
  subscribeToChat: (chatId, callback) => {
    // This would be replaced with actual socket.io implementation
    console.log(`Subscribed to chat ${chatId}`);
    return () => console.log(`Unsubscribed from chat ${chatId}`);
  }
};

export default chatApi; 