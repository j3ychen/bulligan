const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard - Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const view = req.query.view || 'friends'; // 'friends' or 'global'
    const timeframe = req.query.timeframe || 'today'; // 'today', 'week', 'month', 'alltime'
    const limit = parseInt(req.query.limit) || 50;

    let dateFilter;
    switch (timeframe) {
      case 'today':
        dateFilter = "s.date = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "s.date >= DATE_TRUNC('week', CURRENT_DATE)";
        break;
      case 'month':
        dateFilter = "s.date >= DATE_TRUNC('month', CURRENT_DATE)";
        break;
      case 'alltime':
      default:
        dateFilter = "1=1";
        break;
    }

    let query;
    let queryParams;

    if (view === 'friends') {
      // Friends leaderboard - only show user's friends and self
      query = `
        WITH friend_ids AS (
          SELECT friend_id FROM friendships WHERE user_id = $1
          UNION
          SELECT $1 as friend_id
        ),
        user_scores AS (
          SELECT
            u.user_id, u.username,
            COALESCE(SUM(s.golf_score), 0) as total_score,
            COUNT(s.score_id) as days_played,
            CASE WHEN COUNT(s.score_id) > 0 THEN ROUND(AVG(s.golf_score)::numeric, 2) ELSE 0 END as avg_score
          FROM users u
          LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
          WHERE u.user_id IN (SELECT friend_id FROM friend_ids)
          GROUP BY u.user_id, u.username
        )
        SELECT
          user_id, username, total_score, days_played, avg_score,
          RANK() OVER (ORDER BY total_score ASC, avg_score ASC) as rank
        FROM user_scores
        WHERE days_played > 0 OR user_id = $1
        ORDER BY rank
        LIMIT $2`;
      queryParams = [req.user.user_id, limit];
    } else {
      // Global leaderboard
      query = `
        WITH user_scores AS (
          SELECT
            u.user_id, u.username,
            COALESCE(SUM(s.golf_score), 0) as total_score,
            COUNT(s.score_id) as days_played,
            CASE WHEN COUNT(s.score_id) > 0 THEN ROUND(AVG(s.golf_score)::numeric, 2) ELSE 0 END as avg_score
          FROM users u
          LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
          WHERE u.is_active = true
          GROUP BY u.user_id, u.username
          HAVING COUNT(s.score_id) > 0
        )
        SELECT
          user_id, username, total_score, days_played, avg_score,
          RANK() OVER (ORDER BY total_score ASC, avg_score ASC) as rank
        FROM user_scores
        ORDER BY rank
        LIMIT $1`;
      queryParams = [limit];
    }

    const result = await pool.query(query, queryParams);

    const leaderboard = result.rows.map(row => ({
      rank: parseInt(row.rank),
      userId: row.user_id,
      username: row.username,
      score: parseInt(row.total_score),
      daysPlayed: parseInt(row.days_played),
      avgScore: parseFloat(row.avg_score),
      isCurrentUser: row.user_id === req.user.user_id
    }));

    // Get total players count
    let totalPlayersQuery;
    if (view === 'friends') {
      totalPlayersQuery = await pool.query(
        'SELECT COUNT(*) + 1 as count FROM friendships WHERE user_id = $1',
        [req.user.user_id]
      );
    } else {
      totalPlayersQuery = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_active = true'
      );
    }

    res.json({
      view,
      timeframe,
      leaderboard,
      totalPlayers: parseInt(totalPlayersQuery.rows[0].count)
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// GET /api/leaderboard/rank - Get current user's rank
router.get('/rank', authenticateToken, async (req, res) => {
  try {
    const view = req.query.view || 'friends';
    const timeframe = req.query.timeframe || 'week';

    let dateFilter;
    switch (timeframe) {
      case 'today':
        dateFilter = "s.date = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "s.date >= DATE_TRUNC('week', CURRENT_DATE)";
        break;
      case 'month':
        dateFilter = "s.date >= DATE_TRUNC('month', CURRENT_DATE)";
        break;
      case 'alltime':
      default:
        dateFilter = "1=1";
        break;
    }

    let query;
    let queryParams;

    if (view === 'friends') {
      query = `
        WITH friend_ids AS (
          SELECT friend_id FROM friendships WHERE user_id = $1
          UNION
          SELECT $1 as friend_id
        ),
        user_scores AS (
          SELECT
            u.user_id,
            COALESCE(SUM(s.golf_score), 0) as total_score,
            COUNT(s.score_id) as days_played,
            CASE WHEN COUNT(s.score_id) > 0 THEN ROUND(AVG(s.golf_score)::numeric, 2) ELSE 0 END as avg_score
          FROM users u
          LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
          WHERE u.user_id IN (SELECT friend_id FROM friend_ids)
          GROUP BY u.user_id
          HAVING COUNT(s.score_id) > 0
        ),
        ranked AS (
          SELECT
            user_id, total_score, days_played, avg_score,
            RANK() OVER (ORDER BY total_score ASC, avg_score ASC) as rank,
            COUNT(*) OVER () as total_players
          FROM user_scores
        )
        SELECT rank, total_score, days_played, total_players FROM ranked WHERE user_id = $1`;
      queryParams = [req.user.user_id];
    } else {
      query = `
        WITH user_scores AS (
          SELECT
            u.user_id,
            COALESCE(SUM(s.golf_score), 0) as total_score,
            COUNT(s.score_id) as days_played,
            CASE WHEN COUNT(s.score_id) > 0 THEN ROUND(AVG(s.golf_score)::numeric, 2) ELSE 0 END as avg_score
          FROM users u
          LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
          WHERE u.is_active = true
          GROUP BY u.user_id
          HAVING COUNT(s.score_id) > 0
        ),
        ranked AS (
          SELECT
            user_id, total_score, days_played, avg_score,
            RANK() OVER (ORDER BY total_score ASC, avg_score ASC) as rank,
            COUNT(*) OVER () as total_players
          FROM user_scores
        )
        SELECT rank, total_score, days_played, total_players FROM ranked WHERE user_id = $1`;
      queryParams = [req.user.user_id];
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      res.json({
        view,
        timeframe,
        rank: null,
        score: 0,
        daysPlayed: 0,
        totalPlayers: 0,
        message: 'No scores for this timeframe'
      });
      return;
    }

    const row = result.rows[0];

    res.json({
      view,
      timeframe,
      rank: parseInt(row.rank),
      score: parseInt(row.total_score),
      daysPlayed: parseInt(row.days_played),
      totalPlayers: parseInt(row.total_players)
    });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

module.exports = router;
