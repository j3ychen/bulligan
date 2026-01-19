const pool = require('../config/database');

// Get user statistics
const getUserStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get user overall stats
    const userResult = await pool.query(
      `SELECT username, total_score, total_rounds_played, total_holes_played,
              career_avg_score, best_round_score, hole_in_ones
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userStats = userResult.rows[0];

    // Get current month's stats
    const currentMonthResult = await pool.query(
      `SELECT urs.*, mr.year, mr.month
       FROM user_round_stats urs
       JOIN monthly_rounds mr ON urs.round_id = mr.round_id
       WHERE urs.user_id = $1
       AND mr.year = EXTRACT(YEAR FROM CURRENT_DATE)
       AND mr.month = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [userId]
    );

    const currentMonthStats = currentMonthResult.rows[0] || null;

    // Get recent scores (last 10)
    const recentScoresResult = await pool.query(
      `SELECT s.*, m.date, m.par_value, m.closing_price, m.actual_change_pct,
              p.predicted_close_value, p.predicted_change_pct
       FROM scores s
       JOIN daily_market_data m ON s.date = m.date
       LEFT JOIN predictions p ON s.prediction_id = p.prediction_id
       WHERE s.user_id = $1
       ORDER BY s.date DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      user: userStats,
      currentMonth: currentMonthStats,
      recentScores: recentScoresResult.rows,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Server error fetching user statistics' });
  }
};

// Get user's monthly performance
const getMonthlyPerformance = async (req, res) => {
  const userId = req.user.userId;
  const { year, month } = req.query;

  try {
    const result = await pool.query(
      `SELECT urs.*, mr.year, mr.month, mr.start_date, mr.end_date
       FROM user_round_stats urs
       JOIN monthly_rounds mr ON urs.round_id = mr.round_id
       WHERE urs.user_id = $1
       ${year ? 'AND mr.year = $2' : ''}
       ${month ? 'AND mr.month = $3' : ''}
       ORDER BY mr.year DESC, mr.month DESC`,
      year && month ? [userId, year, month] : year ? [userId, year] : [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get monthly performance error:', error);
    res.status(500).json({ error: 'Server error fetching monthly performance' });
  }
};

module.exports = {
  getUserStats,
  getMonthlyPerformance,
};
