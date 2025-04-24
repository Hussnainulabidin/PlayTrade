const mongoose = require("mongoose");
const validator = require("validator");
const { createOrderChat } = require('../utils/chatUtils');
const Chat = require('./chatModel');

const orderSchema = new mongoose.Schema(
  {
    accountID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "A valorant account must a accountID"],
    },
    clientID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "A valorant account must a cutomerID"],
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "A valorant account must a sellerID"],
    },
    creartedAT: {
      type: Date,
      default: Date.now()
    },
    status: {
      type: String,
      enum: ["processing", "completed", "refunded"],
      default: "processing",
    },
    review: {
      type: String,
      enum: ["positive", "negative"],
    },
    reviewMessage: {
      type: String,
      maxlength: 100,
    },
    game : String,
    price : Number
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Add notification to chat when order status changes
orderSchema.pre('save', async function(next) {
  // Skip if this is a new document or status hasn't changed
  if (this.isNew || !this.isModified('status')) {
    return next();
  }
  
  try {
    // Find the chat for this order
    const chat = await Chat.findOne({ orderId: this._id });
    
    if (chat) {
      // Add a status update message to the chat as a system message
      const statusMessage = {
        sender: this.sellerID, // Keep the seller as technical sender for reference
        content: `Order status updated to: ${this.status}`,
        timestamp: Date.now(),
        isSystemMessage: true, // Mark as system message
        read: true // No need for notifications for system messages
      };
      
      chat.messages.push(statusMessage);
      chat.lastActivity = Date.now();
      await chat.save();
    }
    
    next();
  } catch (error) {
    console.error('Error updating chat with status change:', error);
    next(error);
  }
});

// Auto-create a chat when a new order is created
orderSchema.post('save', async function(doc) {
  try {
    // Check if a chat already exists for this order (the createOrderChat function will handle this check)
    const initialMessage = `Order has been created. Order status: ${doc.status}`;
    await createOrderChat(
      doc._id,
      doc.clientID, // Buyer
      doc.sellerID, // Seller
      initialMessage
    );
  } catch (error) {
    console.error('Error creating chat for order:', error);
  }
});

const order = mongoose.model("order", orderSchema , "order");

module.exports = order;