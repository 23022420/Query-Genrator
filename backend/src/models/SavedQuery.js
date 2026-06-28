const mongoose = require('mongoose');

const savedQuerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  sql: {
    type: String,
    required: true
  },
  prompt: String,
  tags: [String],
  isFavorite: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

savedQuerySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedQuery', savedQuerySchema);
