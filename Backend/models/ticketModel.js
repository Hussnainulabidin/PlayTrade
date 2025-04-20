const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chat',
  },
  sellerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'Ticket must have a seller']
  },
  ticketType: {
    type: String,
    enum: ['Rating Issue', 'Order Issue', 'Marketplace Issue'],
    required: [true, 'Ticket must have a type']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open'
  },
  assignedAdmin: {
    type: mongoose.Schema.ObjectId,
    ref: 'user'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
ticketSchema.index({ chatId: 1 });
ticketSchema.index({ sellerId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ assignedAdmin: 1 });

// Update lastActivity whenever the ticket is modified
ticketSchema.pre('save', function(next) {
  this.lastActivity = Date.now();
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket; 