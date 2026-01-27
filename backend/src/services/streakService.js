// Streak Service - Streak tracking and mulligan awards

const pool = require('../config/database');
const { formatDateTimeET } = require('../utils/timezone');

// Mulligan award thresholds
const STREAK_THRESHOLD_FOR_MULLIGAN = 5;
const MAX_MULLIGANS = 2;

/**
 * Update streaks for all users after scoring for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object>} - Summary of streak updates
 */
async function updateStreaksForDate(date) {
  console.log(`[${formatDateTimeET()}] Updating streaks for ${date}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get all users who played today (have a score for this date)
    const playersResult = await client.query(
      `SELECT DISTINCT user_id FROM scores WHERE date = $1`,
      [date]
    );

    const playerIds = playersResult.rows.map(r => r.user_id);
    console.log(`  - ${playerIds.length} users played on ${date}`);

    // Get all active users who didn't play today
    const nonPlayersResult = await client.query(
      `SELECT user_id, current_streak FROM users
       WHERE is_active = true
       AND user_id NOT IN (SELECT user_id FROM scores WHERE date = $1)`,
      [date]
    );

    const nonPlayers = nonPlayersResult.rows;
    console.log(`  - ${nonPlayers.length} active users did not play`);

    let streaksIncremented = 0;
    let streaksReset = 0;
    let mulligansAwarded = 0;

    // Increment streaks for players
    for (const userId of playerIds) {
      const result = await incrementStreak(client, userId);
      streaksIncremented++;

      if (result.mulliganAwarded) {
        mulligansAwarded++;
      }
    }

    // Reset streaks for non-players
    for (const user of nonPlayers) {
      if (user.current_streak > 0) {
        await resetStreak(client, user.user_id);
        streaksReset++;
      }
    }

    await client.query('COMMIT');

    console.log(`  - Streaks incremented: ${streaksIncremented}`);
    console.log(`  - Streaks reset: ${streaksReset}`);
    console.log(`  - Mulligans awarded: ${mulligansAwarded}`);

    return {
      date,
      streaksIncremented,
      streaksReset,
      mulligansAwarded
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating streaks:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Increment a user's streak and potentially award a mulligan
 * @param {object} client - Database client
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Result with new streak and mulligan status
 */
async function incrementStreak(client, userId) {
  // Get current user data
  const userResult = await client.query(
    `SELECT current_streak, longest_streak, mulligans_available, mulligans_earned_total
     FROM users WHERE user_id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  const newStreak = user.current_streak + 1;
  const newLongestStreak = Math.max(user.longest_streak, newStreak);

  let mulliganAwarded = false;
  let newMulligansAvailable = user.mulligans_available;
  let newMulligansEarned = user.mulligans_earned_total;

  // Check if eligible for mulligan award (every 5 days, max 2)
  if (newStreak % STREAK_THRESHOLD_FOR_MULLIGAN === 0 && user.mulligans_available < MAX_MULLIGANS) {
    newMulligansAvailable = Math.min(user.mulligans_available + 1, MAX_MULLIGANS);
    newMulligansEarned++;
    mulliganAwarded = true;
    console.log(`  - User ${userId.substring(0, 8)} earned a mulligan (streak: ${newStreak})`);
  }

  // Update user
  await client.query(
    `UPDATE users SET
       current_streak = $1,
       longest_streak = $2,
       mulligans_available = $3,
       mulligans_earned_total = $4
     WHERE user_id = $5`,
    [newStreak, newLongestStreak, newMulligansAvailable, newMulligansEarned, userId]
  );

  return {
    userId,
    newStreak,
    newLongestStreak,
    mulliganAwarded
  };
}

/**
 * Reset a user's current streak to 0
 * @param {object} client - Database client
 * @param {string} userId - User ID
 */
async function resetStreak(client, userId) {
  await client.query(
    `UPDATE users SET current_streak = 0 WHERE user_id = $1`,
    [userId]
  );
}

/**
 * Get streak info for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
async function getUserStreak(userId) {
  const result = await pool.query(
    `SELECT current_streak, longest_streak, mulligans_available, mulligans_earned_total
     FROM users WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const daysUntilMulligan = STREAK_THRESHOLD_FOR_MULLIGAN - (user.current_streak % STREAK_THRESHOLD_FOR_MULLIGAN);

  return {
    currentStreak: user.current_streak,
    longestStreak: user.longest_streak,
    mulligansAvailable: user.mulligans_available,
    mulligansEarnedTotal: user.mulligans_earned_total,
    daysUntilNextMulligan: user.mulligans_available >= MAX_MULLIGANS ? null : daysUntilMulligan
  };
}

/**
 * Award a mulligan to a user (manual/admin)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Whether mulligan was awarded
 */
async function awardMulligan(userId) {
  const result = await pool.query(
    `UPDATE users
     SET mulligans_available = LEAST(mulligans_available + 1, $1),
         mulligans_earned_total = mulligans_earned_total + 1
     WHERE user_id = $2 AND mulligans_available < $1
     RETURNING mulligans_available`,
    [MAX_MULLIGANS, userId]
  );

  return result.rowCount > 0;
}

module.exports = {
  updateStreaksForDate,
  incrementStreak,
  resetStreak,
  getUserStreak,
  awardMulligan,
  STREAK_THRESHOLD_FOR_MULLIGAN,
  MAX_MULLIGANS
};
