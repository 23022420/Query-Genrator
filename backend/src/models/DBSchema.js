const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: String,
  type: String,
  isPrimaryKey: { type: Boolean, default: false },
  isForeignKey: { type: Boolean, default: false },
  references: String,
  nullable: { type: Boolean, default: true }
}, { _id: false });

const tableSchema = new mongoose.Schema({
  name: String,
  columns: [columnSchema]
}, { _id: false });

const dbSchemaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  tables: [tableSchema],
  rawSchema: String
}, { timestamps: true });

module.exports = mongoose.model('DBSchema', dbSchemaSchema);
