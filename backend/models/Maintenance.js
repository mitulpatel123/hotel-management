const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  issues: [{
    roomNumber: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
