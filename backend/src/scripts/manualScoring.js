#!/usr/bin/env node

// Manual Scoring Script - CLI for manual/backfill scoring
// Usage:
//   npm run job:score-date -- --date 2026-01-24
//   npm run job:score-date -- --date 2026-01-24 --close 5985.50
//   npm run job:score-date -- --date 2026-01-24 --force

require('dotenv').config();

const { getSP500Historical, getVIXHistoricalClose } = require('../services/marketDataService');
const { calculateScoresForDate, createDailyMarketData, lockPredictionsForDate, areScoresCalculated, getMarketDataForDate } = require('../services/scoringService');
const { isTradingDay, getPreviousTradingDay } = require('../services/tradingCalendarService');
const { formatDateTimeET } = require('../utils/timezone');
const pool = require('../config/database');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    close: null,
    force: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--date' || arg === '-d') {
      options.date = args[++i];
    } else if (arg === '--close' || arg === '-c') {
      options.close = parseFloat(args[++i]);
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Manual Scoring Script - Backfill or recalculate scores for a specific date

Usage:
  npm run job:score-date -- [options]

Options:
  --date, -d <YYYY-MM-DD>   Date to process (required)
  --close, -c <price>       Override closing price (optional, fetches from Yahoo if not provided)
  --force, -f               Force recalculation even if scores exist
  --help, -h                Show this help message

Examples:
  npm run job:score-date -- --date 2026-01-24
  npm run job:score-date -- --date 2026-01-24 --close 5985.50
  npm run job:score-date -- --date 2026-01-24 --force

Notes:
  - The script will create market data if it doesn't exist
  - Lock predictions before calculating scores
  - Update user stats and streaks
`);
}

async function runManualScoring(options) {
  const { date, close: overrideClose, force } = options;

  console.log(`\n========================================`);
  console.log(`MANUAL SCORING - ${date}`);
  console.log(`Executed at: ${formatDateTimeET()}`);
  console.log(`========================================\n`);

  try {
    // Validate date
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Check if trading day
    if (!isTradingDay(date)) {
      console.log(`${date} is not a trading day.`);
      return { success: false, error: 'Not a trading day' };
    }

    // Check if already calculated (unless force)
    if (!force) {
      const alreadyCalculated = await areScoresCalculated(date);
      if (alreadyCalculated) {
        console.log(`Scores already calculated for ${date}. Use --force to recalculate.`);
        return { success: true, skipped: true, reason: 'Already calculated' };
      }
    }

    // Get or create market data
    let marketData = await getMarketDataForDate(date);

    if (!marketData) {
      console.log(`No market data found. Fetching historical data...`);

      // Fetch historical S&P 500 data
      const sp500Data = await getSP500Historical(date);
      if (!sp500Data) {
        throw new Error(`Could not fetch S&P 500 data for ${date}`);
      }

      // Fetch VIX from previous trading day
      const previousTradingDay = getPreviousTradingDay(date);
      const vixClose = await getVIXHistoricalClose(previousTradingDay);
      if (vixClose === null) {
        throw new Error(`Could not fetch VIX data for ${previousTradingDay}`);
      }

      // Create market data record
      marketData = await createDailyMarketData(date, sp500Data.open, vixClose);
      console.log(`Created market data: Open=${marketData.opening_price}, VIX=${marketData.vix_previous_close}, Par=${marketData.par_value}`);
    }

    // Lock predictions
    console.log('Locking predictions...');
    const lockedCount = await lockPredictionsForDate(date);
    console.log(`  - Locked ${lockedCount} predictions`);

    // Determine closing price
    let closingPrice = overrideClose;

    if (!closingPrice) {
      // Fetch from historical data
      const sp500Data = await getSP500Historical(date);
      if (sp500Data) {
        closingPrice = sp500Data.close;
      } else {
        throw new Error(`Could not determine closing price for ${date}. Provide --close option.`);
      }
    }

    console.log(`Using closing price: ${closingPrice}`);

    // Reset scores_calculated if forcing
    if (force) {
      await pool.query(
        `UPDATE daily_market_data SET scores_calculated = false WHERE date = $1`,
        [date]
      );
    }

    // Calculate scores
    const result = await calculateScoresForDate(date, closingPrice);

    console.log(`\nScoring complete:`);
    console.log(`  - Scores created: ${result.scoresCreated}`);
    console.log(`  - Weather: ${result.weather}`);
    console.log(`  - Par: ${result.par}`);

    return {
      success: true,
      ...result
    };

  } catch (error) {
    console.error('\nError in manual scoring:', error);
    return { success: false, error: error.message };
  }
}

// Main execution
if (require.main === module) {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.date) {
    console.error('Error: --date is required\n');
    showHelp();
    process.exit(1);
  }

  runManualScoring(options)
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

module.exports = { runManualScoring };
