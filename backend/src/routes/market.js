const express = require('express');
const router = express.Router();
const {
  getTodayMarketData,
  getMarketDataByDate,
  getMarketDataRange,
} = require('../controllers/marketController');
const { authenticateToken } = require('../middleware/auth');

// All market data routes require authentication
router.get('/today', authenticateToken, getTodayMarketData);
router.get('/date/:date', authenticateToken, getMarketDataByDate);
router.get('/range', authenticateToken, getMarketDataRange);

module.exports = router;
