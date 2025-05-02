import API from './index';

const chatApi = {
  // Chat management
  getMyChats: () => API.get('/chats/my-chats'),
  getChatById: (chatId) => API.get(`/chats/${chatId}`),

  // Order chat methods
  getChatByOrderId: (orderId) => API.get(`/chats/order/${orderId}`),
  sendMessageToOrderChat: (orderId, messageData) => API.post(`/chats/order/${orderId}/messages`, messageData),

  // Messages
  sendMessage: (chatId, content) => API.post(`/chats/${chatId}/messages`, { content }),
  markAsRead: (chatId) => API.patch(`/chats/${chatId}/read`),

  // For socket integration
  sendTypingStatus: (chatId, isTyping) => {
    // This would be handled by the socket service, but included here for completeness
    console.log(`User is ${isTyping ? 'typing' : 'not typing'} in chat ${chatId}`);
    return true;
  },

  // Fallback methods for when socket is not available
  sendMessageREST: (chatId, content) => {
    return API.post(`/chats/${chatId}/messages`, { content });
  }
};

export default chatApi; 