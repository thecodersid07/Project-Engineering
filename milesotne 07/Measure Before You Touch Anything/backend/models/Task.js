const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed'],
    index: true,
  },
}, {
  timestamps: true
});

taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
