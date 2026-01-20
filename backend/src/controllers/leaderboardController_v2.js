const pool = require('../config/database');

// Get leaderboard (friends or global, various timeframes)
const getLeaderboard = async (req, res) => {
  const userId = req.user.userId;
  const { view = 'friends', timeframe = 'week' } = req.query; // view: friends|global, timeframe: today|week|month|alltime

  try {
    let query;
    let params;

    // Build date filter based on timeframe
    let dateFilter;
    const today = new Date().toISOString().split('T')[0];

    switch (timeframe) {
      case 'today':
        dateFilter = `s.date = '${today}'`;
        break;
      case 'week':
        // Current week (Monday - Friday)
        dateFilter = `s.date >= date_trunc('week', CURRENT_DATE) AND s.date <= CURRENT_DATE`;
        break;
      case 'month':
        // Current month
        dateFilter = `EXTRACT(YEAR FROM s.date) = EXTRACT(YEAR FROM CURRENT_DATE)
                      AND EXTRACT(MONTH FROM s.date) = EXTRACT(MONTH FROM CURRENT_DATE)`;
        break;
      case 'alltime':
        dateFilter = `1=1`; // No filter
        break;
      default:
        return res.status(400).json({ error: 'Invalid timeframe. Use: today, week, month, or alltime' });
    }

    // Build user filter based on view
    if (view === 'friends') {
      // Show only user's friends + the user themselves
      query = `
        WITH user_friends AS (
          SELECT friend_id as user_id FROM friendships WHERE user_id = $1
          UNION
          SELECT $1 as user_id
        )
        SELECT
          u.user_id,
          u.username,
          COALESCE(SUM(s.golf_score), 0) as total_score,
          COUNT(s.score_id) as days_played,
          ROUND(AVG(s.golf_score), 2) as avg_score,
          COUNT(CASE WHEN s.is_hole_in_one THEN 1 END) as hole_in_ones,
          COUNT(CASE WHEN s.golf_score <= -4 THEN 1 END) as condors,
          COUNT(CASE WHEN s.golf_score = -3 THEN 1 END) as albatrosses,
          COUNT(CASE WHEN s.golf_score = -2 THEN 1 END) as eagles,
          COUNT(CASE WHEN s.golf_score = -1 THEN 1 END) as birdies,
          COUNT(CASE WHEN s.golf_score = 0 THEN 1 END) as pars,
          COUNT(CASE WHEN s.golf_score = 1 THEN 1 END) as bogeys,
          COUNT(CASE WHEN s.golf_score = 2 THEN 1 END) as double_bogeys,
          COUNT(CASE WHEN s.is_mulligan THEN 1 END) as mulligans_used
        FROM users u
        INNER JOIN user_friends uf ON u.user_id = uf.user_id
        LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
        GROUP BY u.user_id, u.username
        HAVING COUNT(s.score_id) > 0
        ORDER BY total_score ASC, avg_score ASC, days_played DESC
        LIMIT 100
      `;
      params = [userId];
    } else if (view === 'global') {
      // Show all users globally
      query = `
        SELECT
          u.user_id,
          u.username,
          COALESCE(SUM(s.golf_score), 0) as total_score,
          COUNT(s.score_id) as days_played,
          ROUND(AVG(s.golf_score), 2) as avg_score,
          COUNT(CASE WHEN s.is_hole_in_one THEN 1 END) as hole_in_ones,
          COUNT(CASE WHEN s.golf_score <= -4 THEN 1 END) as condors,
          COUNT(CASE WHEN s.golf_score = -3 THEN 1 END) as albatrosses,
          COUNT(CASE WHEN s.golf_score = -2 THEN 1 END) as eagles,
          COUNT(CASE WHEN s.golf_score = -1 THEN 1 END) as birdies,
          COUNT(CASE WHEN s.golf_score = 0 THEN 1 END) as pars,
          COUNT(CASE WHEN s.golf_score = 1 THEN 1 END) as bogeys,
          COUNT(CASE WHEN s.golf_score = 2 THEN 1 END) as double_bogeys,
          COUNT(CASE WHEN s.is_mulligan THEN 1 END) as mulligans_used
        FROM users u
        LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
        WHERE u.is_active = true
        GROUP BY u.user_id, u.username
        HAVING COUNT(s.score_id) > 0
        ORDER BY total_score ASC, avg_score ASC, days_played DESC
        LIMIT 100
      `;
      params = [];
    } else {
      return res.status(400).json({ error: 'Invalid view. Use: friends or global' });
    }

    const result = await pool.query(query, params);

    // Add rank numbers
    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      ...row,
    }));

    res.json({
      view,
      timeframe,
      leaderboard,
      totalPlayers: leaderboard.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
};

// Get user's rank in leaderboard
const getUserRank = async (req, res) => {
  const userId = req.user.userId;
  const { view = 'friends', timeframe = 'week' } = req.query;

  try {
    // Build date filter
    let dateFilter;
    const today = new Date().toISOString().split('T')[0];

    switch (timeframe) {
      case 'today':
        dateFilter = `s.date = '${today}'`;
        break;
      case 'week':
        dateFilter = `s.date >= date_trunc('week', CURRENT_DATE) AND s.date <= CURRENT_DATE`;
        break;
      case 'month':
        dateFilter = `EXTRACT(YEAR FROM s.date) = EXTRACT(YEAR FROM CURRENT_DATE)
                      AND EXTRACT(MONTH FROM s.date) = EXTRACT(MONTH FROM CURRENT_DATE)`;
        break;
      case 'alltime':
        dateFilter = `1=1`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid timeframe' });
    }

    let query;
    let params;

    if (view === 'friends') {
      query = `
        WITH user_friends AS (
          SELECT friend_id as user_id FROM friendships WHERE user_id = $1
          UNION
          SELECT $1 as user_id
        ),
        ranked_users AS (
          SELECT
            u.user_id,
            COALESCE(SUM(s.golf_score), 0) as total_score,
            COUNT(s.score_id) as days_played,
            RANK() OVER (ORDER BY COALESCE(SUM(s.golf_score), 0) ASC, COUNT(s.score_id) DESC) as rank
          FROM users u
          INNER JOIN user_friends uf ON u.user_id = uf.user_id
          LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
          GROUP BY u.user_id
          HAVING COUNT(s.score_id) > 0
        )
        SELECT rank, total_score, days_played,
               (SELECT COUNT(*) FROM ranked_users) as total_players
        FROM ranked_users
        WHERE user_id = $1
      `;
      params = [userId];
    } else {
      query = `
        WITH ranked_users AS (
          SELECT
            u.user_id,
            COALESCE(SUM(s.golf_score), 0) as total_score,
            COUNT(s.score_id) as days_played,
            RANK() OVER (ORDER BY COALESCE(SUM(s.golf_score), 0) ASC, COUNT(s.score_id) DESC) as rank
          FROM users u
          LEFT JOIN scores s ON u.user_id = s.user_id AND ${dateFilter}
          WHERE u.is_active = true
          GROUP BY u.user_id
          HAVING COUNT(s.score_id) > 0
        )
        SELECT rank, total_score, days_played,
               (SELECT COUNT(*) FROM ranked_users) as total_players
        FROM ranked_users
        WHERE user_id = $1
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.json({
        rank: null,
        message: `No scores found for ${timeframe}`,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Server error fetching user rank' });
  }
};

module.exports = {
  getLeaderboard,
  getUserRank,
};
