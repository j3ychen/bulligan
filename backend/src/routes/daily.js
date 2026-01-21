const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to get Eastern Time
const getETTime = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
};

// Helper function to check if prediction window is open (before 11 AM ET)
const isPredictionWindowOpen = () => {
  const etTime = new Date(getETTime());
  const hour = etTime.getHours();
  return hour < 11;
};

// Helper function to check if mulligan window is open (11 AM - 2 PM ET)
const isMulliganWindowOpen = () => {
  const etTime = new Date(getETTime());
  const hour = etTime.getHours();
  return hour >= 11 && hour < 14;
};

// GET /api/daily/today - Get today's market data and user's prediction status
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's market data
    const marketResult = await pool.query(
      `SELECT date, opening_price, closing_price, vix_previous_close, par_value,
              weather_condition, scores_calculated
       FROM daily_market_data WHERE date = $1`,
      [today]
    );

    // Get yesterday's close for reference
    const yesterdayResult = await pool.query(
      `SELECT date, closing_price FROM daily_market_data
       WHERE date < $1 AND is_trading_day = true
       ORDER BY date DESC LIMIT 1`,
      [today]
    );

    // Get user's prediction for today
    const predictionResult = await pool.query(
      `SELECT prediction_id, predicted_close_value, submitted_at, is_locked, is_mulligan
       FROM predictions WHERE user_id = $1 AND date = $2`,
      [req.user.user_id, today]
    );

    // Get user's mulligan count and streak
    const userResult = await pool.query(
      `SELECT mulligans_available, current_streak FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    const marketData = marketResult.rows[0] || null;
    const yesterday = yesterdayResult.rows[0] || null;
    const prediction = predictionResult.rows[0] || null;
    const userData = userResult.rows[0] || { mulligans_available: 0, current_streak: 0 };

    // Calculate deadlines
    const etNow = new Date(getETTime());
    const predictionDeadline = new Date(etNow);
    predictionDeadline.setHours(11, 0, 0, 0);

    const mulliganDeadline = new Date(etNow);
    mulliganDeadline.setHours(14, 0, 0, 0);

    const resultsTime = new Date(etNow);
    resultsTime.setHours(16, 0, 0, 0);

    res.json({
      date: today,
      previousClose: yesterday ? parseFloat(yesterday.closing_price) : null,
      previousCloseDate: yesterday?.date || null,
      currentOpen: marketData ? parseFloat(marketData.opening_price) : null,
      par: marketData?.par_value || null,
      vix: marketData ? parseFloat(marketData.vix_previous_close) : null,
      predictionDeadline: predictionDeadline.toISOString(),
      mulliganDeadline: mulliganDeadline.toISOString(),
      resultsTime: resultsTime.toISOString(),
      isPredictionWindowOpen: isPredictionWindowOpen(),
      isMulliganWindowOpen: isMulliganWindowOpen(),
      scoresCalculated: marketData?.scores_calculated || false,
      userPrediction: prediction ? {
        predictionId: prediction.prediction_id,
        predictedClose: parseFloat(prediction.predicted_close_value),
        submittedAt: prediction.submitted_at,
        isLocked: prediction.is_locked,
        usedMulligan: prediction.is_mulligan
      } : null,
      mulligansAvailable: userData.mulligans_available,
      currentStreak: userData.current_streak
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ error: 'Failed to get today\'s data' });
  }
});

// POST /api/daily/predict - Submit or edit prediction (before 11 AM)
router.post('/predict', authenticateToken, async (req, res) => {
  try {
    const { predictedClose } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!predictedClose || predictedClose <= 0) {
      return res.status(400).json({ error: 'Valid predicted close value is required' });
    }

    if (!isPredictionWindowOpen()) {
      return res.status(400).json({ error: 'Prediction window is closed (after 11 AM ET)' });
    }

    // Check if user already has a prediction for today
    const existingPrediction = await pool.query(
      'SELECT prediction_id, is_locked FROM predictions WHERE user_id = $1 AND date = $2',
      [req.user.user_id, today]
    );

    let result;
    if (existingPrediction.rows.length > 0) {
      if (existingPrediction.rows[0].is_locked) {
        return res.status(400).json({ error: 'Prediction is already locked' });
      }

      // Update existing prediction
      result = await pool.query(
        `UPDATE predictions
         SET predicted_close_value = $1, last_edited_at = CURRENT_TIMESTAMP
         WHERE user_id = $2 AND date = $3
         RETURNING prediction_id, predicted_close_value, submitted_at, last_edited_at`,
        [predictedClose, req.user.user_id, today]
      );
    } else {
      // Create new prediction
      result = await pool.query(
        `INSERT INTO predictions (user_id, date, predicted_close_value)
         VALUES ($1, $2, $3)
         RETURNING prediction_id, predicted_close_value, submitted_at`,
        [req.user.user_id, today, predictedClose]
      );
    }

    const prediction = result.rows[0];

    res.json({
      message: 'Prediction saved successfully',
      prediction: {
        predictionId: prediction.prediction_id,
        predictedClose: parseFloat(prediction.predicted_close_value),
        submittedAt: prediction.submitted_at,
        lastEditedAt: prediction.last_edited_at || null
      }
    });
  } catch (error) {
    console.error('Submit prediction error:', error);
    res.status(500).json({ error: 'Failed to submit prediction' });
  }
});

// POST /api/daily/mulligan - Submit mulligan prediction (11 AM - 2 PM)
router.post('/mulligan', authenticateToken, async (req, res) => {
  try {
    const { predictedClose } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!predictedClose || predictedClose <= 0) {
      return res.status(400).json({ error: 'Valid predicted close value is required' });
    }

    if (!isMulliganWindowOpen()) {
      return res.status(400).json({ error: 'Mulligan window is not open (11 AM - 2 PM ET only)' });
    }

    // Check user's mulligan count
    const userResult = await pool.query(
      'SELECT mulligans_available FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (userResult.rows[0].mulligans_available < 1) {
      return res.status(400).json({ error: 'No mulligans available' });
    }

    // Check if user has a prediction for today
    const predictionResult = await pool.query(
      'SELECT prediction_id, predicted_close_value, is_mulligan FROM predictions WHERE user_id = $1 AND date = $2',
      [req.user.user_id, today]
    );

    if (predictionResult.rows.length === 0) {
      return res.status(400).json({ error: 'No original prediction found for today' });
    }

    const originalPrediction = predictionResult.rows[0];

    if (originalPrediction.is_mulligan) {
      return res.status(400).json({ error: 'Mulligan already used for today' });
    }

    // Use mulligan: update prediction and decrement mulligan count
    await pool.query('BEGIN');

    try {
      // Update prediction with mulligan
      await pool.query(
        `UPDATE predictions
         SET predicted_close_value = $1,
             is_mulligan = true,
             mulligan_submitted_at = CURRENT_TIMESTAMP,
             original_prediction = $2
         WHERE prediction_id = $3`,
        [predictedClose, originalPrediction.predicted_close_value, originalPrediction.prediction_id]
      );

      // Decrement user's mulligan count and increment used total
      await pool.query(
        `UPDATE users
         SET mulligans_available = mulligans_available - 1,
             mulligans_used_total = mulligans_used_total + 1
         WHERE user_id = $1`,
        [req.user.user_id]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Mulligan used successfully',
        prediction: {
          newPredictedClose: predictedClose,
          originalPredictedClose: parseFloat(originalPrediction.predicted_close_value),
          mulliganUsedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Mulligan error:', error);
    res.status(500).json({ error: 'Failed to use mulligan' });
  }
});

// GET /api/daily/result/:date - Get results for specific date
router.get('/result/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;

    // Get market data for the date
    const marketResult = await pool.query(
      `SELECT date, closing_price, par_value, weather_condition, scores_calculated
       FROM daily_market_data WHERE date = $1`,
      [date]
    );

    if (marketResult.rows.length === 0) {
      return res.status(404).json({ error: 'No market data for this date' });
    }

    const marketData = marketResult.rows[0];

    if (!marketData.scores_calculated) {
      return res.status(400).json({ error: 'Scores not yet calculated for this date' });
    }

    // Get user's score for the date
    const scoreResult = await pool.query(
      `SELECT s.*, p.predicted_close_value, p.is_mulligan, p.original_prediction
       FROM scores s
       JOIN predictions p ON s.prediction_id = p.prediction_id
       WHERE s.user_id = $1 AND s.date = $2`,
      [req.user.user_id, date]
    );

    if (scoreResult.rows.length === 0) {
      return res.status(404).json({ error: 'No score found for this date' });
    }

    const score = scoreResult.rows[0];

    res.json({
      date: marketData.date,
      par: marketData.par_value,
      actualClose: parseFloat(marketData.closing_price),
      weather: marketData.weather_condition,
      userResult: {
        predictedClose: parseFloat(score.predicted_close_value),
        strokes: score.strokes,
        golfScore: score.golf_score,
        scoreName: score.score_name,
        deviationPct: parseFloat(score.deviation_pct),
        isHoleInOne: score.is_hole_in_one,
        usedMulligan: score.is_mulligan,
        originalPrediction: score.original_prediction ? parseFloat(score.original_prediction) : null
      }
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to get result' });
  }
});

// GET /api/daily/history - Get user's score history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;

    const result = await pool.query(
      `SELECT s.date, s.strokes, s.par, s.golf_score, s.score_name,
              s.deviation_pct, s.is_hole_in_one, s.used_mulligan,
              p.predicted_close_value, m.closing_price, m.weather_condition
       FROM scores s
       JOIN predictions p ON s.prediction_id = p.prediction_id
       JOIN daily_market_data m ON s.date = m.date
       WHERE s.user_id = $1
       ORDER BY s.date DESC
       LIMIT $2`,
      [req.user.user_id, limit]
    );

    const history = result.rows.map(row => ({
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
    }));

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

module.exports = router;
