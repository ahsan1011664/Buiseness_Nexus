const mongoose = require('mongoose');

const collaborationRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique requests between investor and entrepreneur
collaborationRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);

module.exports = CollaborationRequest; 