const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bulligan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete all data!\n');

  try {
    console.log('🗑️  Dropping all tables...');

    // Drop tables in correct order (respecting foreign keys)
    const tables = [
      'notifications',
      'friendships',
      'user_tournament_stats',
      'weekly_tournaments',
      'user_round_stats',
      'monthly_rounds',
      'scores',
      'predictions',
      'daily_market_data',
      'users'
    ];

    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`  ✓ Dropped ${table}`);
    }

    console.log('\n✅ All tables dropped successfully!');
    console.log('\nNext steps:');
    console.log('  1. npm run init-db     # Recreate tables');
    console.log('  2. npm run seed        # Populate with sample data\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
