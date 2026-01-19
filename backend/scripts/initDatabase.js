const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bulligan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDatabase() {
  console.log('🚀 Initializing database...');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    console.log('📝 Running schema.sql...');
    await pool.query(schema);

    console.log('✅ Database initialized successfully!');
    console.log('\nTables created:');
    console.log('  - users');
    console.log('  - daily_market_data');
    console.log('  - predictions');
    console.log('  - scores');
    console.log('  - monthly_rounds');
    console.log('  - user_round_stats');
    console.log('  - weekly_tournaments');
    console.log('  - user_tournament_stats');
    console.log('  - friendships');
    console.log('  - notifications');
    console.log('\nNext step: Run seed script to populate sample data');
    console.log('  npm run seed');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running and connection details are correct');
      console.error('   Check your .env file or environment variables');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
