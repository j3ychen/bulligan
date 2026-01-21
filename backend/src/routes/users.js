const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:userId - Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
        user_id, username, created_at,
        total_days_played, total_score, avg_score, best_score,
        current_streak, longest_streak,
        mulligans_available, mulligans_earned_total, mulligans_used_total,
        hole_in_ones, condors, albatrosses, eagles, birdies, pars,
        bogeys, double_bogeys, triple_bogeys, worse
       FROM users WHERE user_id = $1 AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isOwnProfile = userId === req.user.user_id;

    // Get recent scores
    const scoresResult = await pool.query(
      `SELECT s.date, s.strokes, s.par, s.golf_score, s.score_name,
              s.deviation_pct, s.is_hole_in_one, s.used_mulligan,
              p.predicted_close_value, m.closing_price, m.weather_condition
       FROM scores s
       JOIN predictions p ON s.prediction_id = p.prediction_id
       JOIN daily_market_data m ON s.date = m.date
       WHERE s.user_id = $1
       ORDER BY s.date DESC
       LIMIT 15`,
      [userId]
    );

    // Get ranks
    const friendsRankResult = await pool.query(
      `WITH friend_ids AS (
        SELECT friend_id FROM friendships WHERE user_id = $1
        UNION SELECT $1 as friend_id
       ),
       ranked AS (
        SELECT u.user_id, RANK() OVER (ORDER BY u.avg_score ASC) as rank,
               COUNT(*) OVER () as total
        FROM users u
        WHERE u.user_id IN (SELECT friend_id FROM friend_ids) AND u.total_days_played > 0
       )
       SELECT rank, total FROM ranked WHERE user_id = $2`,
      [req.user.user_id, userId]
    );

    const globalRankResult = await pool.query(
      `WITH ranked AS (
        SELECT user_id, RANK() OVER (ORDER BY avg_score ASC) as rank,
               COUNT(*) OVER () as total
        FROM users WHERE total_days_played > 0 AND is_active = true
       )
       SELECT rank, total FROM ranked WHERE user_id = $1`,
      [userId]
    );

    res.json({
      userId: user.user_id,
      username: user.username,
      createdAt: user.created_at,
      stats: {
        totalDaysPlayed: user.total_days_played,
        totalScore: user.total_score,
        avgScore: parseFloat(user.avg_score) || 0,
        bestScore: user.best_score,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak
      },
      mulligans: isOwnProfile ? {
        available: user.mulligans_available,
        earnedTotal: user.mulligans_earned_total,
        usedTotal: user.mulligans_used_total
      } : undefined,
      scoreDistribution: {
        holeInOnes: user.hole_in_ones,
        condors: user.condors,
        albatrosses: user.albatrosses,
        eagles: user.eagles,
        birdies: user.birdies,
        pars: user.pars,
        bogeys: user.bogeys,
        doubleBogeys: user.double_bogeys,
        tripleBogeys: user.triple_bogeys,
        worse: user.worse
      },
      recentScores: scoresResult.rows.map(row => ({
        date: row.date,
        par: row.par,
        strokes: row.strokes,
        golfScore: row.golf_score,
        scoreName: row.score_name,
        predictedClose: parseFloat(row.predicted_close_value),
        actualClose: parseFloat(row.closing_price),
        deviationPct: parseFloat(row.deviation_pct),
        isHoleInOne: row.is_hole_in_one,
        usedMulligan: row.used_mulligan,
        weather: row.weather_condition
      })),
      rank: {
        friends: friendsRankResult.rows[0] ? {
          rank: parseInt(friendsRankResult.rows[0].rank),
          total: parseInt(friendsRankResult.rows[0].total)
        } : null,
        global: globalRankResult.rows[0] ? {
          rank: parseInt(globalRankResult.rows[0].rank),
          total: parseInt(globalRankResult.rows[0].total)
        } : null
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// PATCH /api/users/me - Update own profile
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    // Validate username
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if username is taken by another user
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 AND user_id != $2',
      [username.toLowerCase(), req.user.user_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Update username
    const result = await pool.query(
      `UPDATE users SET username = $1 WHERE user_id = $2
       RETURNING user_id, username, email`,
      [username.toLowerCase(), req.user.user_id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: result.rows[0].user_id,
        username: result.rows[0].username,
        email: result.rows[0].email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/me/stats - Get detailed stats for current user
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    // Get overall stats
    const userResult = await pool.query(
      `SELECT
        total_days_played, total_score, avg_score, best_score,
        current_streak, longest_streak,
        mulligans_available, mulligans_earned_total, mulligans_used_total,
        hole_in_ones, condors, albatrosses, eagles, birdies, pars,
        bogeys, double_bogeys, triple_bogeys, worse
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get monthly stats
    const monthlyResult = await pool.query(
      `SELECT
        SUM(golf_score) as total_score,
        COUNT(*) as days_played,
        AVG(golf_score) as avg_score,
        MIN(golf_score) as best_score
       FROM scores
       WHERE user_id = $1 AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
      [req.user.user_id]
    );

    // Get weekly stats
    const weeklyResult = await pool.query(
      `SELECT
        SUM(golf_score) as total_score,
        COUNT(*) as days_played,
        AVG(golf_score) as avg_score,
        MIN(golf_score) as best_score
       FROM scores
       WHERE user_id = $1 AND date >= DATE_TRUNC('week', CURRENT_DATE)`,
      [req.user.user_id]
    );

    res.json({
      overall: {
        totalDaysPlayed: user.total_days_played,
        totalScore: user.total_score,
        avgScore: parseFloat(user.avg_score) || 0,
        bestScore: user.best_score,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak
      },
      mulligans: {
        available: user.mulligans_available,
        earnedTotal: user.mulligans_earned_total,
        usedTotal: user.mulligans_used_total
      },
      scoreDistribution: {
        holeInOnes: user.hole_in_ones,
        condors: user.condors,
        albatrosses: user.albatrosses,
        eagles: user.eagles,
        birdies: user.birdies,
        pars: user.pars,
        bogeys: user.bogeys,
        doubleBogeys: user.double_bogeys,
        tripleBogeys: user.triple_bogeys,
        worse: user.worse
      },
      thisMonth: {
        totalScore: parseInt(monthlyResult.rows[0].total_score) || 0,
        daysPlayed: parseInt(monthlyResult.rows[0].days_played) || 0,
        avgScore: parseFloat(monthlyResult.rows[0].avg_score) || 0,
        bestScore: monthlyResult.rows[0].best_score
      },
      thisWeek: {
        totalScore: parseInt(weeklyResult.rows[0].total_score) || 0,
        daysPlayed: parseInt(weeklyResult.rows[0].days_played) || 0,
        avgScore: parseFloat(weeklyResult.rows[0].avg_score) || 0,
        bestScore: weeklyResult.rows[0].best_score
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
