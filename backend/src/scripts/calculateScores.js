#!/usr/bin/env node

// Calculate Scores Script (4:05 PM ET)
// Full scoring pipeline: fetch close, calculate scores, update stats, award mulligans

require('dotenv').config();

const { getClosingData, getSP500Close } = require('../services/marketDataService');
const { calculateScoresForDate, areScoresCalculated, getMarketDataForDate } = require('../services/scoringService');
const { isTradingDay } = require('../services/tradingCalendarService');
const { getTodayET, formatDateTimeET } = require('../utils/timezone');

async function calculateScores(targetDate = null) {
  const date = targetDate || getTodayET();
  console.log(`\n========================================`);
  console.log(`CALCULATE SCORES - ${date}`);
  console.log(`Executed at: ${formatDateTimeET()}`);
  console.log(`========================================\n`);

  try {
    // Check if trading day
    if (!isTradingDay(date)) {
      console.log(`${date} is not a trading day. Skipping.`);
      return { success: true, skipped: true, reason: 'Not a trading day' };
    }

    // Check if scores already calculated
    const alreadyCalculated = await areScoresCalculated(date);
    if (alreadyCalculated) {
      console.log(`Scores already calculated for ${date}. Skipping.`);
      return { success: true, skipped: true, reason: 'Already calculated' };
    }

    // Check if market data exists
    const marketData = await getMarketDataForDate(date);
    if (!marketData) {
      console.log(`No market data found for ${date}. Run morning fetch first.`);
      return { success: false, error: 'No market data found' };
    }

    // Fetch closing data
    console.log('Fetching closing data...');
    const closingData = await getClosingData();
    const closingPrice = closingData.sp500.close;

    console.log(`  - S&P 500 Close: ${closingPrice}`);
    console.log(`  - High: ${closingData.sp500.high}`);
    console.log(`  - Low: ${closingData.sp500.low}`);
    console.log(`  - Change: ${closingData.sp500.changePercent?.toFixed(2)}%`);

    // Calculate scores for all predictions
    const result = await calculateScoresForDate(date, closingPrice);

    console.log(`\nScoring complete:`);
    console.log(`  - Date: ${result.date}`);
    console.log(`  - Scores created: ${result.scoresCreated}`);
    console.log(`  - Weather: ${result.weather}`);
    console.log(`  - Par: ${result.par}`);
    console.log(`  - Closing Price: ${result.closingPrice}`);
    console.log(`  - Actual Change: ${result.actualChangePct}%`);

    if (result.streakResults) {
      console.log(`\nStreak updates:`);
      console.log(`  - Streaks incremented: ${result.streakResults.streaksIncremented}`);
      console.log(`  - Streaks reset: ${result.streakResults.streaksReset}`);
      console.log(`  - Mulligans awarded: ${result.streakResults.mulligansAwarded}`);
    }

    return {
      success: true,
      ...result
    };

  } catch (error) {
    console.error('\nError calculating scores:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  const targetDate = process.argv[2]; // Optional date argument

  calculateScores(targetDate)
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

module.exports = { calculateScores };
