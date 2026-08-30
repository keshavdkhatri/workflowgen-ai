const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');

router.get('/', executionController.getExecutionHistory);
router.get('/:id', executionController.getExecutionById);

module.exports = router;
