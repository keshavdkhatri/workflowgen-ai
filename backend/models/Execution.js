const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflowId: { type: String, required: true },
  workflowName: { type: String, required: true },
  inputs: { type: mongoose.Schema.Types.Mixed, required: true },
  output: { type: mongoose.Schema.Types.Mixed },
  durationMs: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  error: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Execution', executionSchema);
