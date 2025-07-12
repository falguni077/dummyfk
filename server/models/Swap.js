const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemRequested: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemOffered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: false // Optional for point-based redemption
  },
  pointsOffered: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  swapType: {
    type: String,
    enum: ['direct', 'points'],
    required: true
  },
  completedAt: {
    type: Date
  },
  location: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Swap', swapSchema); 