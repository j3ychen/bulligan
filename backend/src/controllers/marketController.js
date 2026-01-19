const pool = require('../config/database');

// Get today's market data
const getTodayMarketData = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT date, is_trading_day, opening_price, closing_price,
              actual_change_pct, high_price, low_price, vix_previous_close,
              par_value, weather_condition, difficulty_multiplier,
              expected_volatility, avg_player_score, scores_calculated
       FROM daily_market_data
       WHERE date = $1`,
      [today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No market data available for today',
        message: 'Market data may not be loaded yet'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get today market data error:', error);
    res.status(500).json({ error: 'Server error fetching market data' });
  }
};

// Get market data by date
const getMarketDataByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      `SELECT date, is_trading_day, opening_price, closing_price,
              actual_change_pct, high_price, low_price, vix_previous_close,
              par_value, weather_condition, difficulty_multiplier,
              expected_volatility, avg_player_score, scores_calculated
       FROM daily_market_data
       WHERE date = $1`,
      [date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Market data not found for this date' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get market data by date error:', error);
    res.status(500).json({ error: 'Server error fetching market data' });
  }
};

// Get market data range
const getMarketDataRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(
      `SELECT date, is_trading_day, opening_price, closing_price,
              actual_change_pct, high_price, low_price, vix_previous_close,
              par_value, weather_condition, avg_player_score, scores_calculated
       FROM daily_market_data
       WHERE date BETWEEN $1 AND $2
       ORDER BY date DESC`,
      [startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get market data range error:', error);
    res.status(500).json({ error: 'Server error fetching market data' });
  }
};

module.exports = {
  getTodayMarketData,
  getMarketDataByDate,
  getMarketDataRange,
};
