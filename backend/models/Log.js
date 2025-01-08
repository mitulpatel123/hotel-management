const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  itemType: {
    type: String,
    enum: ['pass-on', 'complaint', 'reminder', 'maintenance', 'user'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', logSchema);
