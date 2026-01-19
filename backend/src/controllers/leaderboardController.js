const pool = require('../config/database');

// Get monthly leaderboard
const getMonthlyLeaderboard = async (req, res) => {
  const { year, month } = req.query;
  const currentYear = year || new Date().getFullYear();
  const currentMonth = month || new Date().getMonth() + 1;

  try {
    const result = await pool.query(
      `SELECT
         u.user_id, u.username,
         urs.total_score, urs.holes_played, urs.avg_score,
         urs.hole_in_ones, urs.eagles, urs.birdies, urs.pars,
         urs.bogeys, urs.double_bogeys, urs.mulligans_used
       FROM user_round_stats urs
       JOIN users u ON urs.user_id = u.user_id
       JOIN monthly_rounds mr ON urs.round_id = mr.round_id
       WHERE mr.year = $1 AND mr.month = $2
       AND urs.holes_played > 0
       ORDER BY urs.total_score ASC, urs.holes_played DESC
       LIMIT 100`,
      [currentYear, currentMonth]
    );

    res.json({
      year: currentYear,
      month: currentMonth,
      leaderboard: result.rows,
    });
  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
};

// Get weekly leaderboard
const getWeeklyLeaderboard = async (req, res) => {
  const { year, week } = req.query;

  // Calculate current week number
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const currentWeek = week || Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);

  try {
    const result = await pool.query(
      `SELECT
         u.user_id, u.username,
         uts.total_score, uts.holes_played, uts.avg_score
       FROM user_tournament_stats uts
       JOIN users u ON uts.user_id = u.user_id
       JOIN weekly_tournaments wt ON uts.tournament_id = wt.tournament_id
       WHERE wt.year = $1 AND wt.week_number = $2
       AND uts.holes_played > 0
       ORDER BY uts.total_score ASC, uts.holes_played DESC
       LIMIT 100`,
      [currentYear, currentWeek]
    );

    res.json({
      year: currentYear,
      week: currentWeek,
      leaderboard: result.rows,
    });
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching weekly leaderboard' });
  }
};

// Get user's rank in monthly leaderboard
const getUserMonthlyRank = async (req, res) => {
  const userId = req.user.userId;
  const { year, month } = req.query;
  const currentYear = year || new Date().getFullYear();
  const currentMonth = month || new Date().getMonth() + 1;

  try {
    const result = await pool.query(
      `WITH ranked_users AS (
         SELECT
           urs.user_id,
           urs.total_score,
           urs.holes_played,
           RANK() OVER (ORDER BY urs.total_score ASC, urs.holes_played DESC) as rank
         FROM user_round_stats urs
         JOIN monthly_rounds mr ON urs.round_id = mr.round_id
         WHERE mr.year = $1 AND mr.month = $2
         AND urs.holes_played > 0
       )
       SELECT rank, total_score, holes_played
       FROM ranked_users
       WHERE user_id = $3`,
      [currentYear, currentMonth, userId]
    );

    if (result.rows.length === 0) {
      return res.json({ rank: null, message: 'User has not played this month' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Server error fetching user rank' });
  }
};

module.exports = {
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
  getUserMonthlyRank,
};
