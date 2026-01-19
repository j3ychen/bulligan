const express = require('express');
const router = express.Router();
const {
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
  getUserMonthlyRank,
} = require('../controllers/leaderboardController');
const { authenticateToken } = require('../middleware/auth');

// All leaderboard routes require authentication
router.get('/monthly', authenticateToken, getMonthlyLeaderboard);
router.get('/weekly', authenticateToken, getWeeklyLeaderboard);
router.get('/rank/monthly', authenticateToken, getUserMonthlyRank);

module.exports = router;
