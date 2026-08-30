const mongoose = require('mongoose');

const inputFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'textarea', 'select'], default: 'textarea' },
  placeholder: { type: String },
  required: { type: Boolean, default: true },
  options: [{ type: String }]
});

const workflowSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  isCustom: { type: Boolean, default: false },
  inputSchema: [inputFieldSchema],
  promptTemplate: { type: String, required: true },
  systemPrompt: { type: String, required: true },
  outputSchema: { type: Object, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);
