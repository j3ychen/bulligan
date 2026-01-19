const express = require('express');
const router = express.Router();
const {
  getUserHistory,
  getMulliganStatus,
  getBestPerformances,
} = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/auth');

// All history routes require authentication
router.get('/', authenticateToken, getUserHistory);
router.get('/mulligans', authenticateToken, getMulliganStatus);
router.get('/best', authenticateToken, getBestPerformances);

module.exports = router;
