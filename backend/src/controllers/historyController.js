const pool = require('../config/database');

// Get user's prediction and score history
const getUserHistory = async (req, res) => {
  const userId = req.user.userId;
  const { limit = 30, offset = 0 } = req.query;

  try {
    const result = await pool.query(
      `SELECT
         s.date, s.strokes, s.par, s.golf_score, s.score_name,
         s.deviation_pct, s.is_hole_in_one, s.is_mulligan, s.is_gentlemans_eight,
         p.predicted_close_value, p.predicted_change_pct, p.submitted_at,
         m.opening_price, m.closing_price, m.actual_change_pct,
         m.par_value, m.weather_condition, m.vix_previous_close
       FROM scores s
       LEFT JOIN predictions p ON s.prediction_id = p.prediction_id
       JOIN daily_market_data m ON s.date = m.date
       WHERE s.user_id = $1
       ORDER BY s.date DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM scores WHERE user_id = $1',
      [userId]
    );

    res.json({
      history: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ error: 'Server error fetching history' });
  }
};

// Get user's mulligan status for current month
const getMulliganStatus = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT mulligans_remaining, mulligans_used
       FROM user_round_stats urs
       JOIN monthly_rounds mr ON urs.round_id = mr.round_id
       WHERE urs.user_id = $1
       AND mr.year = EXTRACT(YEAR FROM CURRENT_DATE)
       AND mr.month = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        mulligans_remaining: 1,
        mulligans_used: 0,
        message: 'No rounds played this month yet'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get mulligan status error:', error);
    res.status(500).json({ error: 'Server error fetching mulligan status' });
  }
};

// Get user's best performances
const getBestPerformances = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get hole-in-ones
    const holeInOnes = await pool.query(
      `SELECT s.date, s.score_name, m.closing_price, m.actual_change_pct,
              p.predicted_close_value, p.predicted_change_pct
       FROM scores s
       JOIN daily_market_data m ON s.date = m.date
       LEFT JOIN predictions p ON s.prediction_id = p.prediction_id
       WHERE s.user_id = $1 AND s.is_hole_in_one = true
       ORDER BY s.date DESC`,
      [userId]
    );

    // Get best scores (eagles and better)
    const bestScores = await pool.query(
      `SELECT s.date, s.strokes, s.par, s.golf_score, s.score_name,
              m.closing_price, m.actual_change_pct,
              p.predicted_close_value, p.predicted_change_pct
       FROM scores s
       JOIN daily_market_data m ON s.date = m.date
       LEFT JOIN predictions p ON s.prediction_id = p.prediction_id
       WHERE s.user_id = $1 AND s.golf_score <= -2
       ORDER BY s.golf_score ASC, s.date DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      holeInOnes: holeInOnes.rows,
      bestScores: bestScores.rows,
    });
  } catch (error) {
    console.error('Get best performances error:', error);
    res.status(500).json({ error: 'Server error fetching best performances' });
  }
};

module.exports = {
  getUserHistory,
  getMulliganStatus,
  getBestPerformances,
};
