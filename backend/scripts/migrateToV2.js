require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrateToV2() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting migration to schema v2...\n');

    await client.query('BEGIN');

    // Step 1: Add new columns to users table
    console.log('📊 Step 1: Updating users table...');
    await client.query(`
      -- Add streak columns if they don't exist
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_played_date DATE;

      -- Add mulligan columns if they don't exist
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS mulligans_available INTEGER DEFAULT 0 CHECK (mulligans_available BETWEEN 0 AND 2),
      ADD COLUMN IF NOT EXISTS mulligans_earned_total INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS mulligans_used_total INTEGER DEFAULT 0;

      -- Add detailed score distribution if they don't exist
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS condors INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS albatrosses INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS eagles INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS birdies INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pars INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bogeys INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS double_bogeys INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS triple_bogeys INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS worse INTEGER DEFAULT 0;

      -- Rename old columns to match new schema
      ALTER TABLE users
      ALTER COLUMN total_rounds_played DROP NOT NULL,
      ALTER COLUMN total_holes_played DROP NOT NULL;

      -- Update column names if needed
      DO $$ BEGIN
        IF EXISTS(SELECT 1 FROM information_schema.columns
                  WHERE table_name='users' AND column_name='total_rounds_played') THEN
          ALTER TABLE users RENAME COLUMN total_rounds_played TO total_days_played_old;
        END IF;
        IF EXISTS(SELECT 1 FROM information_schema.columns
                  WHERE table_name='users' AND column_name='total_holes_played') THEN
          ALTER TABLE users RENAME COLUMN total_holes_played TO total_days_played;
        END IF;
      END $$;
    `);
    console.log('✅ Users table updated\n');

    // Step 2: Calculate and populate streaks for existing users
    console.log('📊 Step 2: Calculating user streaks...');
    const users = await client.query('SELECT user_id FROM users');

    for (const user of users.rows) {
      // Calculate current streak
      const streakResult = await client.query(`
        WITH RECURSIVE date_series AS (
          SELECT MAX(date) as check_date, 0 as days_back
          FROM scores
          WHERE user_id = $1

          UNION ALL

          SELECT
            (check_date - INTERVAL '1 day')::DATE,
            days_back + 1
          FROM date_series
          WHERE EXISTS (
            SELECT 1 FROM scores
            WHERE user_id = $1
            AND date = (check_date - INTERVAL '1 day')::DATE
          )
          AND days_back < 100
        )
        SELECT COUNT(*) as streak
        FROM date_series
      `, [user.user_id]);

      const currentStreak = streakResult.rows[0]?.streak || 0;

      // Get last played date
      const lastPlayedResult = await client.query(
        'SELECT MAX(date) as last_date FROM scores WHERE user_id = $1',
        [user.user_id]
      );
      const lastPlayedDate = lastPlayedResult.rows[0]?.last_date;

      // Update user
      await client.query(`
        UPDATE users
        SET
          current_streak = $1,
          longest_streak = $1,
          last_played_date = $2,
          mulligans_available = CASE WHEN $1 >= 5 THEN LEAST(FLOOR($1 / 5), 2) ELSE 0 END
        WHERE user_id = $3
      `, [currentStreak, lastPlayedDate, user.user_id]);
    }
    console.log(`✅ Calculated streaks for ${users.rows.length} users\n`);

    // Step 3: Update predictions table (add mulligan tracking)
    console.log('📊 Step 3: Updating predictions table...');
    await client.query(`
      ALTER TABLE predictions
      ADD COLUMN IF NOT EXISTS is_mulligan BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS mulligan_submitted_at TIMESTAMP WITH TIME ZONE;

      -- Remove old gentleman's eight column if it exists
      ALTER TABLE predictions
      DROP COLUMN IF EXISTS is_gentlemans_eight;
    `);
    console.log('✅ Predictions table updated\n');

    // Step 4: Update scores table
    console.log('📊 Step 4: Updating scores table...');
    await client.query(`
      -- Ensure is_mulligan column exists
      ALTER TABLE scores
      ADD COLUMN IF NOT EXISTS is_mulligan BOOLEAN DEFAULT false;

      -- Remove old columns if they exist
      ALTER TABLE scores
      DROP COLUMN IF EXISTS is_gentlemans_eight,
      DROP COLUMN IF EXISTS original_score_id;
    `);
    console.log('✅ Scores table updated\n');

    // Step 5: Update score distribution in users table
    console.log('📊 Step 5: Populating score distribution...');
    await client.query(`
      UPDATE users u
      SET
        condors = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score <= -4),
        albatrosses = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = -3),
        eagles = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = -2),
        birdies = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = -1),
        pars = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = 0),
        bogeys = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = 1),
        double_bogeys = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = 2),
        triple_bogeys = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score = 3),
        worse = (SELECT COUNT(*) FROM scores WHERE user_id = u.user_id AND golf_score >= 4);
    `);
    console.log('✅ Score distribution populated\n');

    // Step 6: Simplify friendships table
    console.log('📊 Step 6: Simplifying friendships table...');
    await client.query(`
      -- Remove status column if it exists
      ALTER TABLE friendships
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS accepted_at;

      -- Drop old indexes
      DROP INDEX IF EXISTS idx_friendships_accepted;
      DROP INDEX IF EXISTS idx_friendships_pending;
    `);
    console.log('✅ Friendships table simplified\n');

    // Step 7: Update VIX to Par function
    console.log('📊 Step 7: Updating calculate_par_from_vix function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION calculate_par_from_vix(vix DECIMAL)
      RETURNS INTEGER AS $$
      BEGIN
          RETURN CASE
              WHEN vix < 16 THEN 3
              WHEN vix < 21 THEN 4  -- UPDATED from 20
              WHEN vix < 25 THEN 5
              ELSE 6
          END;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);
    console.log('✅ VIX function updated\n');

    // Step 8: Drop old tournament tables
    console.log('📊 Step 8: Removing tournament tables...');
    await client.query(`
      DROP TABLE IF EXISTS user_tournament_stats CASCADE;
      DROP TABLE IF EXISTS weekly_tournaments CASCADE;
      DROP TABLE IF EXISTS user_round_stats CASCADE;
      DROP TABLE IF EXISTS monthly_rounds CASCADE;
    `);
    console.log('✅ Tournament tables removed\n');

    // Step 9: Recalculate par values based on new VIX ranges
    console.log('📊 Step 9: Recalculating par values...');
    await client.query(`
      UPDATE daily_market_data
      SET par_value = calculate_par_from_vix(vix_previous_close)
      WHERE vix_previous_close IS NOT NULL;
    `);
    console.log('✅ Par values recalculated\n');

    await client.query('COMMIT');

    console.log('✨ Migration to schema v2 completed successfully!\n');
    console.log('Changes applied:');
    console.log('  ✅ Added streak tracking to users');
    console.log('  ✅ Added mulligan system (earn via 5-day streaks)');
    console.log('  ✅ Added detailed score distribution');
    console.log('  ✅ Simplified friendships (instant add)');
    console.log('  ✅ Updated VIX to Par ranges (16-21 = Par 4, 21-25 = Par 5)');
    console.log('  ✅ Removed monthly tournaments and weekly tournaments');
    console.log('  ✅ Removed Gentleman\'s 8 penalty\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateToV2()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
