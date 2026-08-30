const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');

router.post('/', insightController.analyzeProcess);
router.get('/stats', insightController.getStats);

module.exports = router;
