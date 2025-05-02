const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'Message must have a sender']
  },
  content: {
    type: String,
    required: [true, 'Message cannot be empty']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  // Explicitly define sender (usually the seller) and receiver (usually the buyer or admin)
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'Chat must have a sender']
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
  // Can be either orderId or ticketId, but not both
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'order',
    required: false
  },
  ticketId: {
    type: mongoose.Schema.ObjectId,
    ref: 'ticket',
    required: false
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to get participants (for compatibility with existing code)
chatSchema.virtual('participants').get(function () {
  return [this.sender, this.receiver];
});

// Index for efficiently finding chats by sender, receiver and orderId/ticketId
chatSchema.index({ sender: 1, receiver: 1, orderId: 1 });
chatSchema.index({ sender: 1, receiver: 1, ticketId: 1 });

// Update lastActivity whenever a new message is added
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.lastActivity = Date.now();
  }
  next();
});

// Validate that either orderId or ticketId is present, but not both
chatSchema.pre('save', function (next) {
  console.log("4");
  if ((!this.orderId && !this.ticketId) || (this.orderId && this.ticketId)) {
    next(new Error('Chat must have either an orderId or a ticketId, but not both'));
  }
  console.log("5");
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 