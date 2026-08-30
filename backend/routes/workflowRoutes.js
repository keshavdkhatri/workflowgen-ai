const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

router.get('/', workflowController.getAllWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.post('/', workflowController.createCustomWorkflow);

module.exports = router;
