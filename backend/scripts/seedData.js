const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bulligan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Helper function to calculate par from VIX
function calculatePar(vix) {
  if (vix < 16) return 3;
  if (vix < 20) return 4;
  if (vix < 25) return 5;
  return 6;
}

// Generate mock market data for the last 30 trading days
function generateMarketData() {
  const data = [];
  const today = new Date();
  let currentPrice = 5800;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Generate realistic market movement
    const changePercent = (Math.random() - 0.48) * 2; // Slight upward bias
    const opening = currentPrice;
    const closing = opening * (1 + changePercent / 100);
    const high = Math.max(opening, closing) * (1 + Math.random() * 0.5 / 100);
    const low = Math.min(opening, closing) * (1 - Math.random() * 0.5 / 100);

    // VIX tends to be between 12-25 normally
    const vix = 15 + Math.random() * 8 + (changePercent < -1 ? 5 : 0);

    const par = calculatePar(vix);

    // Weather conditions based on volatility
    let weather = 'Perfect';
    let difficultyMultiplier = 1.0;
    if (vix > 22) {
      weather = 'Fog';
      difficultyMultiplier = 1.2;
    }
    if (vix > 28) {
      weather = 'Thunderstorm';
      difficultyMultiplier = 1.5;
    }

    const isToday = i === 0;

    data.push({
      date: date.toISOString().split('T')[0],
      opening_price: opening.toFixed(2),
      closing_price: isToday ? null : closing.toFixed(2), // Today has no closing yet
      actual_change_pct: isToday ? null : changePercent.toFixed(4),
      high_price: isToday ? null : high.toFixed(2),
      low_price: isToday ? null : low.toFixed(2),
      vix_previous_close: vix.toFixed(2),
      par_value: par,
      weather_condition: weather,
      difficulty_multiplier: difficultyMultiplier.toFixed(2),
      expected_volatility: (Math.abs(changePercent) / 2).toFixed(4),
      scores_calculated: !isToday,
    });

    currentPrice = closing;
  }

  return data;
}

// Create sample users
async function seedUsers() {
  const bcrypt = require('bcryptjs');

  const users = [
    { username: 'demo_user', email: 'demo@bulligan.com', password: 'password123' },
    { username: 'MarketMaster', email: 'market@bulligan.com', password: 'password123' },
    { username: 'BullRunner', email: 'bull@bulligan.com', password: 'password123' },
    { username: 'EagleEye', email: 'eagle@bulligan.com', password: 'password123' },
  ];

  console.log('👥 Creating sample users...');

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, user.email, passwordHash]
    );
  }

  console.log(`✅ Created ${users.length} users`);
  console.log('   You can login with:');
  console.log('   - Username: demo_user, Password: password123');
}

// Seed market data
async function seedMarketData() {
  console.log('📈 Generating market data...');

  const marketData = generateMarketData();

  for (const data of marketData) {
    await pool.query(
      `INSERT INTO daily_market_data (
        date, opening_price, closing_price, actual_change_pct,
        high_price, low_price, vix_previous_close, par_value,
        weather_condition, difficulty_multiplier, expected_volatility,
        scores_calculated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (date) DO NOTHING`,
      [
        data.date, data.opening_price, data.closing_price, data.actual_change_pct,
        data.high_price, data.low_price, data.vix_previous_close, data.par_value,
        data.weather_condition, data.difficulty_multiplier, data.expected_volatility,
        data.scores_calculated
      ]
    );
  }

  console.log(`✅ Created ${marketData.length} days of market data`);
}

// Create monthly rounds
async function seedMonthlyRounds() {
  console.log('📅 Creating monthly rounds...');

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Create current month round
  const firstDay = new Date(currentYear, currentMonth - 1, 1);
  const lastDay = new Date(currentYear, currentMonth, 0);

  // Count trading days in the month
  const result = await pool.query(
    `SELECT COUNT(*) as total_holes
     FROM daily_market_data
     WHERE date >= $1 AND date <= $2 AND is_trading_day = true`,
    [firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]]
  );

  await pool.query(
    `INSERT INTO monthly_rounds (year, month, start_date, end_date, total_holes, is_complete)
     VALUES ($1, $2, $3, $4, $5, false)
     ON CONFLICT (year, month) DO NOTHING`,
    [currentYear, currentMonth, firstDay.toISOString().split('T')[0],
     lastDay.toISOString().split('T')[0], result.rows[0].total_holes]
  );

  console.log(`✅ Created monthly round for ${currentMonth}/${currentYear}`);
}

// Generate sample predictions and scores for demo users
async function seedPredictionsAndScores() {
  console.log('🎯 Creating sample predictions and scores...');

  const users = await pool.query('SELECT user_id, username FROM users LIMIT 4');
  const marketDays = await pool.query(
    `SELECT date, opening_price, closing_price, par_value
     FROM daily_market_data
     WHERE closing_price IS NOT NULL
     ORDER BY date DESC
     LIMIT 20`
  );

  let predictionCount = 0;
  let scoreCount = 0;

  for (const user of users.rows) {
    // Create predictions for random past days
    const daysToPredict = Math.floor(Math.random() * 10) + 10; // 10-20 days

    for (let i = 0; i < daysToPredict && i < marketDays.rows.length; i++) {
      const day = marketDays.rows[i];
      const actualClose = parseFloat(day.closing_price);
      const opening = parseFloat(day.opening_price);

      // Generate prediction with varying accuracy
      const accuracy = Math.random();
      let deviation;

      if (accuracy > 0.9) {
        // Very accurate (10% chance)
        deviation = (Math.random() - 0.5) * 0.002; // Within 0.1%
      } else if (accuracy > 0.7) {
        // Good (20% chance)
        deviation = (Math.random() - 0.5) * 0.01; // Within 0.5%
      } else {
        // Normal variance
        deviation = (Math.random() - 0.5) * 0.05; // Within 2.5%
      }

      const predictedClose = actualClose * (1 + deviation);
      const predictedChangePct = ((predictedClose - opening) / opening) * 100;

      // Insert prediction
      const predResult = await pool.query(
        `INSERT INTO predictions (user_id, date, predicted_close_value, predicted_change_pct, is_locked)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (user_id, date) DO NOTHING
         RETURNING prediction_id`,
        [user.user_id, day.date, predictedClose.toFixed(2), predictedChangePct.toFixed(4)]
      );

      if (predResult.rows.length > 0) {
        predictionCount++;

        // Calculate score
        const actualDeviation = Math.abs((predictedClose - actualClose) / actualClose);
        const deviationPct = actualDeviation;

        // Calculate strokes based on deviation
        let strokes;
        if (deviationPct <= 0.001) strokes = 1; // Hole in one
        else if (deviationPct <= 0.0025) strokes = 2;
        else if (deviationPct <= 0.005) strokes = 3;
        else if (deviationPct <= 0.01) strokes = 4;
        else if (deviationPct <= 0.02) strokes = 5;
        else if (deviationPct <= 0.03) strokes = 6;
        else if (deviationPct <= 0.05) strokes = 7;
        else strokes = 8;

        const golfScore = strokes - day.par_value;
        const isHoleInOne = strokes === 1 && day.par_value === 3;

        // Get score name
        let scoreName;
        if (golfScore <= -4) scoreName = 'Condor';
        else if (golfScore === -3) scoreName = 'Albatross';
        else if (golfScore === -2) scoreName = 'Eagle';
        else if (golfScore === -1) scoreName = 'Birdie';
        else if (golfScore === 0) scoreName = 'Par';
        else if (golfScore === 1) scoreName = 'Bogey';
        else if (golfScore === 2) scoreName = 'Double Bogey';
        else if (golfScore === 3) scoreName = 'Triple Bogey';
        else scoreName = 'Quadruple Bogey';

        // Insert score
        await pool.query(
          `INSERT INTO scores (
            prediction_id, user_id, date, strokes, par, golf_score,
            deviation_pct, score_name, is_hole_in_one
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id, date) DO NOTHING`,
          [predResult.rows[0].prediction_id, user.user_id, day.date, strokes,
           day.par_value, golfScore, deviationPct.toFixed(4), scoreName, isHoleInOne]
        );
        scoreCount++;
      }
    }
  }

  console.log(`✅ Created ${predictionCount} predictions and ${scoreCount} scores`);
}

// Update user statistics
async function updateUserStats() {
  console.log('📊 Updating user statistics...');

  const users = await pool.query('SELECT user_id FROM users');

  for (const user of users.rows) {
    // Calculate overall stats
    const stats = await pool.query(
      `SELECT
        COUNT(*) as total_holes_played,
        SUM(golf_score) as total_score,
        AVG(golf_score) as career_avg_score,
        MIN(golf_score) as best_round_score,
        COUNT(*) FILTER (WHERE is_hole_in_one = true) as hole_in_ones
       FROM scores
       WHERE user_id = $1`,
      [user.user_id]
    );

    if (stats.rows[0].total_holes_played > 0) {
      await pool.query(
        `UPDATE users
         SET total_score = $1,
             total_holes_played = $2,
             career_avg_score = $3,
             best_round_score = $4,
             hole_in_ones = $5
         WHERE user_id = $6`,
        [
          stats.rows[0].total_score,
          stats.rows[0].total_holes_played,
          stats.rows[0].career_avg_score,
          stats.rows[0].best_round_score,
          stats.rows[0].hole_in_ones,
          user.user_id
        ]
      );
    }
  }

  console.log('✅ Updated user statistics');
}

// Create user round stats for current month
async function seedUserRoundStats() {
  console.log('🏆 Creating user round stats...');

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Get current month round
  const round = await pool.query(
    'SELECT round_id FROM monthly_rounds WHERE year = $1 AND month = $2',
    [currentYear, currentMonth]
  );

  if (round.rows.length === 0) return;

  const roundId = round.rows[0].round_id;
  const users = await pool.query('SELECT user_id FROM users');

  for (const user of users.rows) {
    // Get user's scores for this month
    const scores = await pool.query(
      `SELECT
        COUNT(*) as holes_played,
        SUM(golf_score) as total_score,
        AVG(golf_score) as avg_score,
        MIN(golf_score) as best_hole_score,
        COUNT(*) FILTER (WHERE is_hole_in_one = true) as hole_in_ones,
        COUNT(*) FILTER (WHERE golf_score = -2) as eagles,
        COUNT(*) FILTER (WHERE golf_score = -1) as birdies,
        COUNT(*) FILTER (WHERE golf_score = 0) as pars,
        COUNT(*) FILTER (WHERE golf_score = 1) as bogeys,
        COUNT(*) FILTER (WHERE golf_score = 2) as double_bogeys
       FROM scores
       WHERE user_id = $1
         AND date >= DATE_TRUNC('month', CURRENT_DATE)
         AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`,
      [user.user_id]
    );

    if (scores.rows[0].holes_played > 0) {
      await pool.query(
        `INSERT INTO user_round_stats (
          user_id, round_id, total_score, holes_played, avg_score,
          best_hole_score, hole_in_ones, eagles, birdies, pars,
          bogeys, double_bogeys, mulligans_remaining, mulligans_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, 0)
        ON CONFLICT (user_id, round_id) DO UPDATE SET
          total_score = EXCLUDED.total_score,
          holes_played = EXCLUDED.holes_played,
          avg_score = EXCLUDED.avg_score,
          best_hole_score = EXCLUDED.best_hole_score,
          hole_in_ones = EXCLUDED.hole_in_ones,
          eagles = EXCLUDED.eagles,
          birdies = EXCLUDED.birdies,
          pars = EXCLUDED.pars,
          bogeys = EXCLUDED.bogeys,
          double_bogeys = EXCLUDED.double_bogeys`,
        [
          user.user_id, roundId, scores.rows[0].total_score,
          scores.rows[0].holes_played, scores.rows[0].avg_score,
          scores.rows[0].best_hole_score, scores.rows[0].hole_in_ones,
          scores.rows[0].eagles, scores.rows[0].birdies, scores.rows[0].pars,
          scores.rows[0].bogeys, scores.rows[0].double_bogeys
        ]
      );
    }
  }

  console.log('✅ Created user round stats');
}

async function seedAll() {
  console.log('🌱 Starting database seeding...\n');

  try {
    await seedUsers();
    await seedMarketData();
    await seedMonthlyRounds();
    await seedPredictionsAndScores();
    await updateUserStats();
    await seedUserRoundStats();

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('You can now:');
    console.log('  1. Start the backend: cd backend && npm run dev');
    console.log('  2. Start the frontend: cd frontend && npm run dev');
    console.log('  3. Login with: demo_user / password123');
    console.log('  4. Visit: http://localhost:5173\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAll();
