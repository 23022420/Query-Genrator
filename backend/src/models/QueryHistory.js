const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 2000
  },
  generatedSQL: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  queryType: {
    type: String,
    enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'OTHER'],
    default: 'SELECT'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  difficultyReason: String,
  isDangerous: {
    type: Boolean,
    default: false
  },
  dangerReason: String,
  isOptimized: {
    type: Boolean,
    default: false
  },
  optimizedSQL: String,
  executionStatus: {
    type: String,
    enum: ['pending', 'success', 'error', 'not_executed'],
    default: 'not_executed'
  },
  executionTime: Number,
  rowsAffected: Number,
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, { timestamps: true });

queryHistorySchema.index({ user: 1, createdAt: -1 });
queryHistorySchema.index({ user: 1, queryType: 1 });

module.exports = mongoose.model('QueryHistory', queryHistorySchema);
