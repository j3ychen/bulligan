const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/friends - Get user's friend list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.avg_score, u.current_streak, u.total_days_played
       FROM friendships f
       JOIN users u ON f.friend_id = u.user_id
       WHERE f.user_id = $1
       ORDER BY u.username`,
      [req.user.user_id]
    );

    const friends = result.rows.map(row => ({
      userId: row.user_id,
      username: row.username,
      avgScore: parseFloat(row.avg_score) || 0,
      currentStreak: row.current_streak,
      totalDaysPlayed: row.total_days_played
    }));

    res.json({ friends, count: friends.length });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// POST /api/friends/add - Add friend by username
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Find user by username
    const userResult = await pool.query(
      'SELECT user_id, username FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendId = userResult.rows[0].user_id;

    // Can't add yourself
    if (friendId === req.user.user_id) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    // Check if already friends
    const existingFriendship = await pool.query(
      'SELECT friendship_id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [req.user.user_id, friendId]
    );

    if (existingFriendship.rows.length > 0) {
      return res.status(409).json({ error: 'Already friends with this user' });
    }

    // Add friendship (bidirectional)
    await pool.query('BEGIN');
    try {
      // Add forward friendship
      await pool.query(
        'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
        [req.user.user_id, friendId]
      );

      // Add reverse friendship
      await pool.query(
        'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [friendId, req.user.user_id]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Friend added successfully',
        friend: {
          userId: friendId,
          username: userResult.rows[0].username
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// DELETE /api/friends/:userId - Remove friend
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Remove friendship (bidirectional)
    await pool.query('BEGIN');
    try {
      await pool.query(
        'DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2',
        [req.user.user_id, userId]
      );

      await pool.query(
        'DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2',
        [userId, req.user.user_id]
      );

      await pool.query('COMMIT');

      res.json({ message: 'Friend removed successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// GET /api/friends/:userId/compare - Head-to-head stats with friend
router.get('/:userId/compare', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if actually friends
    const friendshipResult = await pool.query(
      'SELECT friendship_id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [req.user.user_id, userId]
    );

    if (friendshipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Not friends with this user' });
    }

    // Get friend info
    const friendResult = await pool.query(
      'SELECT user_id, username, avg_score, total_score FROM users WHERE user_id = $1',
      [userId]
    );

    if (friendResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    const friend = friendResult.rows[0];

    // Get head-to-head comparison (days where both played)
    const comparisonResult = await pool.query(
      `SELECT
        s1.date, s1.golf_score as your_score, s2.golf_score as their_score,
        s1.score_name as your_score_name, s2.score_name as their_score_name
       FROM scores s1
       JOIN scores s2 ON s1.date = s2.date
       WHERE s1.user_id = $1 AND s2.user_id = $2
       ORDER BY s1.date DESC
       LIMIT 10`,
      [req.user.user_id, userId]
    );

    // Calculate all-time record
    const recordResult = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE s1.golf_score < s2.golf_score) as wins,
        COUNT(*) FILTER (WHERE s1.golf_score > s2.golf_score) as losses,
        COUNT(*) FILTER (WHERE s1.golf_score = s2.golf_score) as ties
       FROM scores s1
       JOIN scores s2 ON s1.date = s2.date
       WHERE s1.user_id = $1 AND s2.user_id = $2`,
      [req.user.user_id, userId]
    );

    const record = recordResult.rows[0];

    // Get current week comparison
    const weekResult = await pool.query(
      `SELECT
        SUM(s1.golf_score) as your_score,
        SUM(s2.golf_score) as their_score
       FROM scores s1
       JOIN scores s2 ON s1.date = s2.date
       WHERE s1.user_id = $1 AND s2.user_id = $2
       AND s1.date >= DATE_TRUNC('week', CURRENT_DATE)`,
      [req.user.user_id, userId]
    );

    res.json({
      friend: {
        userId: friend.user_id,
        username: friend.username,
        avgScore: parseFloat(friend.avg_score) || 0
      },
      thisWeek: {
        yourScore: parseInt(weekResult.rows[0].your_score) || 0,
        theirScore: parseInt(weekResult.rows[0].their_score) || 0
      },
      allTimeRecord: {
        wins: parseInt(record.wins) || 0,
        losses: parseInt(record.losses) || 0,
        ties: parseInt(record.ties) || 0
      },
      recentHeadToHead: comparisonResult.rows.map(row => ({
        date: row.date,
        yourScore: row.your_score,
        theirScore: row.their_score,
        yourScoreName: row.your_score_name,
        theirScoreName: row.their_score_name,
        youWon: row.your_score < row.their_score
      }))
    });
  } catch (error) {
    console.error('Compare friends error:', error);
    res.status(500).json({ error: 'Failed to compare with friend' });
  }
});

// GET /api/friends/search - Search for users by username
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await pool.query(
      `SELECT u.user_id, u.username, u.avg_score,
              EXISTS(SELECT 1 FROM friendships f WHERE f.user_id = $1 AND f.friend_id = u.user_id) as is_friend
       FROM users u
       WHERE u.username ILIKE $2 AND u.user_id != $1 AND u.is_active = true
       ORDER BY u.username
       LIMIT 20`,
      [req.user.user_id, `%${q}%`]
    );

    const users = result.rows.map(row => ({
      userId: row.user_id,
      username: row.username,
      avgScore: parseFloat(row.avg_score) || 0,
      isFriend: row.is_friend
    }));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;
