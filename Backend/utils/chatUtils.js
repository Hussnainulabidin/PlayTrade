const Chat = require('../models/chatModel');

/**
 * Creates a new chat for an order between buyer and seller
 * @param {String} orderId - The ID of the order
 * @param {String} buyerId - The ID of the buyer
 * @param {String} sellerId - The ID of the seller
 * @param {String} initialMessage - Optional initial system message
 * @returns {Promise<Object>} The created chat
 */
exports.createOrderChat = async (orderId, buyerId, sellerId, initialMessage) => {
  try {
    // Check if a chat already exists for this order
    const existingChat = await Chat.findOne({ orderId });
    
    if (existingChat) {
      console.log(`Chat already exists for order ${orderId}`);
      return existingChat;
    }
    
    // Prepare initial message if provided
    const messages = [];
    if (initialMessage) {
      messages.push({
        sender: sellerId, // System message sent as the seller
        content: initialMessage,
        timestamp: Date.now(),
        read: false
      });
    }
    
    // Create new chat
    const newChat = await Chat.create({
      sender: sellerId,     // Seller is typically the sender (initiator)
      receiver: buyerId,    // Buyer is typically the receiver
      orderId,
      messages,
      lastActivity: Date.now()
    });
    
    console.log(`Chat created successfully for order ${orderId}`);
    return newChat;
  } catch (error) {
    console.error('Error creating chat for order:', error);
    throw error;
  }
}; 