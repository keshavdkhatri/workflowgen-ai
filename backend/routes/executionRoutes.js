const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');

router.post('/:workflowId', executionController.executeWorkflow);

module.exports = router;
