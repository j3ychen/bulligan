const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getMonthlyPerformance,
} = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// All profile routes require authentication
router.get('/stats', authenticateToken, getUserStats);
router.get('/monthly', authenticateToken, getMonthlyPerformance);

module.exports = router;
