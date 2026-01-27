// Scoring Service - Orchestrates the daily scoring pipeline

const pool = require('../config/database');
const { calculateScore, calculateParFromVix, calculateWeather } = require('../utils/scoring');
const { formatDateTimeET } = require('../utils/timezone');
const streakService = require('./streakService');

/**
 * Calculate and store scores for all predictions on a given date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} closingPrice - S&P 500 closing price
 * @returns {Promise<object>} - Summary of scoring results
 */
async function calculateScoresForDate(date, closingPrice) {
  console.log(`[${formatDateTimeET()}] Starting score calculation for ${date}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get market data for the date
    const marketResult = await client.query(
      'SELECT * FROM daily_market_data WHERE date = $1',
      [date]
    );

    if (marketResult.rows.length === 0) {
      throw new Error(`No market data found for ${date}`);
    }

    const marketData = marketResult.rows[0];

    if (marketData.scores_calculated) {
      console.log(`Scores already calculated for ${date}`);
      return { alreadyCalculated: true, date };
    }

    const par = marketData.par_value;
    const openPrice = parseFloat(marketData.opening_price);

    // Calculate actual change percentage
    const actualChangePct = ((closingPrice - openPrice) / openPrice) * 100;

    // Calculate weather condition
    const expectedVolatility = marketData.expected_volatility || 0.5;
    const weather = calculateWeather(actualChangePct, expectedVolatility);

    // Update market data with closing info
    await client.query(
      `UPDATE daily_market_data
       SET closing_price = $1,
           actual_change_pct = $2,
           weather_condition = $3
       WHERE date = $4`,
      [closingPrice, actualChangePct, weather, date]
    );

    // Get all predictions for the date
    const predictionsResult = await client.query(
      `SELECT p.*, u.user_id
       FROM predictions p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.date = $1 AND p.is_locked = true`,
      [date]
    );

    const predictions = predictionsResult.rows;
    console.log(`Processing ${predictions.length} predictions`);

    let scoresCreated = 0;
    const scoreUpdates = [];

    for (const prediction of predictions) {
      const predictedClose = parseFloat(prediction.predicted_close_value);

      // Calculate score using utility function
      const scoreResult = calculateScore(predictedClose, closingPrice, par);

      // Insert score
      await client.query(
        `INSERT INTO scores (
           prediction_id, user_id, date, strokes, par, golf_score,
           deviation_pct, score_name, is_hole_in_one, used_mulligan
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (user_id, date) DO UPDATE SET
           strokes = EXCLUDED.strokes,
           par = EXCLUDED.par,
           golf_score = EXCLUDED.golf_score,
           deviation_pct = EXCLUDED.deviation_pct,
           score_name = EXCLUDED.score_name,
           is_hole_in_one = EXCLUDED.is_hole_in_one,
           used_mulligan = EXCLUDED.used_mulligan`,
        [
          prediction.prediction_id,
          prediction.user_id,
          date,
          scoreResult.strokes,
          par,
          scoreResult.golfScore,
          scoreResult.deviationPct,
          scoreResult.scoreName,
          scoreResult.isHoleInOne,
          prediction.is_mulligan
        ]
      );

      scoreUpdates.push({
        userId: prediction.user_id,
        golfScore: scoreResult.golfScore,
        category: scoreResult.category
      });

      scoresCreated++;
    }

    // Update user stats
    for (const update of scoreUpdates) {
      await updateUserStats(client, update.userId, update.golfScore, update.category);
    }

    // Mark scores as calculated
    await client.query(
      `UPDATE daily_market_data
       SET scores_calculated = true, calculated_at = CURRENT_TIMESTAMP
       WHERE date = $1`,
      [date]
    );

    await client.query('COMMIT');

    // Update streaks (after commit to ensure scores are in)
    const streakResults = await streakService.updateStreaksForDate(date);

    console.log(`[${formatDateTimeET()}] Score calculation complete for ${date}`);
    console.log(`  - Scores created: ${scoresCreated}`);
    console.log(`  - Weather: ${weather}`);
    console.log(`  - Close: ${closingPrice}, Par: ${par}`);

    return {
      date,
      scoresCreated,
      weather,
      closingPrice,
      par,
      actualChangePct: Math.round(actualChangePct * 10000) / 10000,
      streakResults
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error calculating scores for ${date}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update user statistics after scoring
 * @param {object} client - Database client
 * @param {string} userId - User ID
 * @param {number} golfScore - Golf score (strokes - par)
 * @param {string} category - Score category for distribution
 */
async function updateUserStats(client, userId, golfScore, category) {
  // Get current user stats
  const userResult = await client.query(
    'SELECT total_days_played, total_score, best_score FROM users WHERE user_id = $1',
    [userId]
  );

  const user = userResult.rows[0];
  const newTotalDays = user.total_days_played + 1;
  const newTotalScore = user.total_score + golfScore;
  const newAvgScore = newTotalScore / newTotalDays;
  const newBestScore = user.best_score === null
    ? golfScore
    : Math.min(user.best_score, golfScore);

  // Update user stats and score distribution
  await client.query(
    `UPDATE users SET
       total_days_played = $1,
       total_score = $2,
       avg_score = $3,
       best_score = $4,
       ${category} = ${category} + 1
     WHERE user_id = $5`,
    [newTotalDays, newTotalScore, newAvgScore, newBestScore, userId]
  );
}

/**
 * Create daily market data record with morning data
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} openPrice - S&P 500 opening price
 * @param {number} vixPreviousClose - VIX previous day close
 * @returns {Promise<object>} - Created market data record
 */
async function createDailyMarketData(date, openPrice, vixPreviousClose) {
  console.log(`[${formatDateTimeET()}] Creating daily market data for ${date}`);

  const par = calculateParFromVix(vixPreviousClose);

  // Expected volatility is roughly VIX / 16 for daily (annualized to daily conversion)
  const expectedVolatility = vixPreviousClose / 15.87; // sqrt(252) ≈ 15.87

  const result = await pool.query(
    `INSERT INTO daily_market_data (
       date, is_trading_day, opening_price, vix_previous_close,
       par_value, expected_volatility
     ) VALUES ($1, true, $2, $3, $4, $5)
     ON CONFLICT (date) DO UPDATE SET
       opening_price = EXCLUDED.opening_price,
       vix_previous_close = EXCLUDED.vix_previous_close,
       par_value = EXCLUDED.par_value,
       expected_volatility = EXCLUDED.expected_volatility
     RETURNING *`,
    [date, openPrice, vixPreviousClose, par, expectedVolatility]
  );

  const record = result.rows[0];
  console.log(`  - Open: ${openPrice}, VIX: ${vixPreviousClose}, Par: ${par}`);

  return record;
}

/**
 * Lock all predictions for a given date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number>} - Number of predictions locked
 */
async function lockPredictionsForDate(date) {
  console.log(`[${formatDateTimeET()}] Locking predictions for ${date}`);

  const result = await pool.query(
    `UPDATE predictions
     SET is_locked = true, locked_at = CURRENT_TIMESTAMP
     WHERE date = $1 AND is_locked = false
     RETURNING prediction_id`,
    [date]
  );

  const count = result.rowCount;
  console.log(`  - Locked ${count} predictions`);

  return count;
}

/**
 * Check if scores have been calculated for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>}
 */
async function areScoresCalculated(date) {
  const result = await pool.query(
    'SELECT scores_calculated FROM daily_market_data WHERE date = $1',
    [date]
  );

  if (result.rows.length === 0) {
    return false;
  }

  return result.rows[0].scores_calculated;
}

/**
 * Get market data for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object|null>}
 */
async function getMarketDataForDate(date) {
  const result = await pool.query(
    'SELECT * FROM daily_market_data WHERE date = $1',
    [date]
  );

  return result.rows[0] || null;
}

module.exports = {
  calculateScoresForDate,
  createDailyMarketData,
  lockPredictionsForDate,
  areScoresCalculated,
  getMarketDataForDate,
  updateUserStats
};
