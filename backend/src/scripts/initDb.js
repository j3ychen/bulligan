// Database initialization script
// Run with: node src/scripts/initDb.js

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Connecting to database...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema...');

    // Execute the schema
    await pool.query(schema);

    console.log('Database initialized successfully!');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - daily_market_data');
    console.log('  - predictions');
    console.log('  - scores');
    console.log('  - friendships');
    console.log('Helper functions created:');
    console.log('  - calculate_par_from_vix()');
    console.log('  - calculate_strokes()');
    console.log('  - get_golf_score_name()');
    console.log('  - calculate_weather()');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
