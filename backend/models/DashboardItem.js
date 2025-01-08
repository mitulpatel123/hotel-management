const mongoose = require('mongoose');

const dashboardItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pass-on', 'complaint', 'reminder'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
dashboardItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DashboardItem', dashboardItemSchema);
