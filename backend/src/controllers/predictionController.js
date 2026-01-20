const pool = require('../config/database');

// Submit or update prediction
const submitPrediction = async (req, res) => {
  const { predictedCloseValue, date } = req.body;
  const userId = req.user.userId;

  try {
    // Validate input
    if (!predictedCloseValue || !date) {
      return res.status(400).json({ error: 'Predicted close value and date are required' });
    }

    if (predictedCloseValue <= 0) {
      return res.status(400).json({ error: 'Predicted value must be positive' });
    }

    // Check if market data exists for this date
    const marketData = await pool.query(
      'SELECT opening_price, is_trading_day, closing_price FROM daily_market_data WHERE date = $1',
      [date]
    );

    if (marketData.rows.length === 0) {
      return res.status(404).json({ error: 'No market data available for this date' });
    }

    if (!marketData.rows[0].is_trading_day) {
      return res.status(400).json({ error: 'This is not a trading day' });
    }

    // Check if market already closed (prediction deadline passed)
    if (marketData.rows[0].closing_price !== null) {
      return res.status(400).json({ error: 'Prediction deadline has passed for this date' });
    }

    // Calculate predicted change percentage
    const openingPrice = parseFloat(marketData.rows[0].opening_price);
    const predictedChangePct = ((predictedCloseValue - openingPrice) / openingPrice) * 100;

    // Check if prediction already exists
    const existingPrediction = await pool.query(
      'SELECT prediction_id, is_locked FROM predictions WHERE user_id = $1 AND date = $2',
      [userId, date]
    );

    let result;

    if (existingPrediction.rows.length > 0) {
      // Update existing prediction
      if (existingPrediction.rows[0].is_locked) {
        return res.status(400).json({ error: 'Prediction is locked and cannot be modified' });
      }

      result = await pool.query(
        `UPDATE predictions
         SET predicted_close_value = $1, predicted_change_pct = $2, last_edited_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND date = $4
         RETURNING *`,
        [predictedCloseValue, predictedChangePct, userId, date]
      );
    } else {
      // Insert new prediction
      result = await pool.query(
        `INSERT INTO predictions (user_id, date, predicted_close_value, predicted_change_pct)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, date, predictedCloseValue, predictedChangePct]
      );
    }

    res.json({
      message: 'Prediction submitted successfully',
      prediction: result.rows[0],
    });
  } catch (error) {
    console.error('Submit prediction error:', error);
    res.status(500).json({ error: 'Server error submitting prediction' });
  }
};

// Get user's prediction for a specific date
const getPrediction = async (req, res) => {
  const { date } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT p.*, m.opening_price, m.closing_price, m.par_value
       FROM predictions p
       JOIN daily_market_data m ON p.date = m.date
       WHERE p.user_id = $1 AND p.date = $2`,
      [userId, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({ error: 'Server error fetching prediction' });
  }
};

// Get user's today's prediction
const getTodayPrediction = async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT p.*, m.opening_price, m.closing_price, m.par_value
       FROM predictions p
       JOIN daily_market_data m ON p.date = m.date
       WHERE p.user_id = $1 AND p.date = $2`,
      [userId, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No prediction found for today',
        hasPrediction: false
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get today prediction error:', error);
    res.status(500).json({ error: 'Server error fetching prediction' });
  }
};

// Submit mulligan prediction (11:00 AM - 2:00 PM ET)
const submitMulligan = async (req, res) => {
  const userId = req.user.userId;
  const { predictedCloseValue, date } = req.body;

  try {
    const predDate = date || new Date().toISOString().split('T')[0];

    // Check if user has mulligans available
    const userResult = await pool.query(
      'SELECT mulligans_available FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userResult.rows[0].mulligans_available <= 0) {
      return res.status(400).json({ error: 'No mulligans available' });
    }

    // Check if market data exists
    const marketData = await pool.query(
      'SELECT * FROM daily_market_data WHERE date = $1 AND is_trading_day = true',
      [predDate]
    );

    if (marketData.rows.length === 0) {
      return res.status(404).json({ error: 'No trading day found for this date' });
    }

    // Check if market is already closed
    if (marketData.rows[0].closing_price !== null) {
      return res.status(400).json({ error: 'Market already closed, cannot use mulligan' });
    }

    // Calculate predicted change percentage
    const openingPrice = parseFloat(marketData.rows[0].opening_price);
    const predictedChangePct = ((predictedCloseValue - openingPrice) / openingPrice) * 100;

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update prediction with mulligan
      await client.query(
        `INSERT INTO predictions (user_id, date, predicted_close_value, predicted_change_pct, is_mulligan, mulligan_submitted_at)
         VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, date)
         DO UPDATE SET
           predicted_close_value = $3,
           predicted_change_pct = $4,
           is_mulligan = true,
           mulligan_submitted_at = CURRENT_TIMESTAMP`,
        [userId, predDate, predictedCloseValue, predictedChangePct]
      );

      // Decrement user's mulligan count
      await client.query(
        `UPDATE users
         SET mulligans_available = mulligans_available - 1,
             mulligans_used_total = mulligans_used_total + 1
         WHERE user_id = $1`,
        [userId]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Mulligan used successfully',
        mulligansRemaining: userResult.rows[0].mulligans_available - 1,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Submit mulligan error:', error);
    res.status(500).json({ error: 'Server error using mulligan' });
  }
};

module.exports = {
  submitPrediction,
  getPrediction,
  getTodayPrediction,
  submitMulligan,
};
