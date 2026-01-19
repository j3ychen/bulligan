const express = require('express');
const router = express.Router();
const {
  submitPrediction,
  getPrediction,
  getTodayPrediction,
} = require('../controllers/predictionController');
const { authenticateToken } = require('../middleware/auth');

// All prediction routes require authentication
router.post('/', authenticateToken, submitPrediction);
router.get('/today', authenticateToken, getTodayPrediction);
router.get('/:date', authenticateToken, getPrediction);

module.exports = router;
