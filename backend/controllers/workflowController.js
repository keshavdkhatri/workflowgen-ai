const Workflow = require('../models/Workflow');

// Get all workflows
exports.getAllWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find({});
    res.status(200).json(workflows);
  } catch (error) {
    next(error);
  }
};

// Get single workflow by custom id (e.g. 'research-summarizer')
exports.getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({ id: req.params.id });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(200).json(workflow);
  } catch (error) {
    next(error);
  }
};
