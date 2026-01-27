#!/usr/bin/env node

// Lock Predictions Script (11:00 AM ET)
// Sets is_locked=true for all predictions for today

require('dotenv').config();

const { lockPredictionsForDate } = require('../services/scoringService');
const { isTradingDay } = require('../services/tradingCalendarService');
const { getTodayET, formatDateTimeET } = require('../utils/timezone');

async function lockPredictions(targetDate = null) {
  const date = targetDate || getTodayET();
  console.log(`\n========================================`);
  console.log(`LOCK PREDICTIONS - ${date}`);
  console.log(`Executed at: ${formatDateTimeET()}`);
  console.log(`========================================\n`);

  try {
    // Check if trading day
    if (!isTradingDay(date)) {
      console.log(`${date} is not a trading day. Skipping.`);
      return { success: true, skipped: true, reason: 'Not a trading day' };
    }

    // Lock all predictions for the date
    const lockedCount = await lockPredictionsForDate(date);

    console.log(`\nPredictions locked:`);
    console.log(`  - Date: ${date}`);
    console.log(`  - Count: ${lockedCount}`);

    return {
      success: true,
      date,
      predictionsLocked: lockedCount
    };

  } catch (error) {
    console.error('\nError locking predictions:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  const targetDate = process.argv[2]; // Optional date argument

  lockPredictions(targetDate)
    .then(result => {
      console.log('\n========================================');
      console.log('Result:', JSON.stringify(result, null, 2));
      console.log('========================================\n');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { lockPredictions };
