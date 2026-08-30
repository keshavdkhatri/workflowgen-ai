const express = require('express');
const router = express.Router();
const multer = require('multer');
const workflowController = require('../controllers/workflowController');

// Configure multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', workflowController.getAllWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.post('/', workflowController.createCustomWorkflow);
router.post('/extract-pdf', upload.single('pdf'), workflowController.extractPdfText);

module.exports = router;
