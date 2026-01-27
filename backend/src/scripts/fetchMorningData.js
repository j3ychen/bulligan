#!/usr/bin/env node

// Morning Data Fetch Script (9:30 AM ET)
// Creates daily_market_data record with open price, VIX, and calculated par

require('dotenv').config();

const { getMorningData, getVIXForPar } = require('../services/marketDataService');
const { createDailyMarketData } = require('../services/scoringService');
const { isTradingDay } = require('../services/tradingCalendarService');
const { getTodayET, formatDateTimeET } = require('../utils/timezone');

async function fetchMorningData(targetDate = null) {
  const date = targetDate || getTodayET();
  console.log(`\n========================================`);
  console.log(`MORNING DATA FETCH - ${date}`);
  console.log(`Executed at: ${formatDateTimeET()}`);
  console.log(`========================================\n`);

  try {
    // Check if trading day
    if (!isTradingDay(date)) {
      console.log(`${date} is not a trading day. Skipping.`);
      return { success: true, skipped: true, reason: 'Not a trading day' };
    }

    // Fetch morning data from market
    console.log('Fetching market data...');
    const morningData = await getMorningData();
    console.log(`  - S&P 500 Open: ${morningData.sp500.open}`);
    console.log(`  - VIX Previous Close: ${morningData.vix.previousClose}`);

    // Get VIX for par calculation (previous trading day close)
    const vixForPar = await getVIXForPar(date);
    console.log(`  - VIX for Par: ${vixForPar}`);

    // Create daily market data record
    const record = await createDailyMarketData(
      date,
      morningData.sp500.open,
      vixForPar
    );

    console.log(`\nDaily market data created:`);
    console.log(`  - Date: ${record.date}`);
    console.log(`  - Open: ${record.opening_price}`);
    console.log(`  - VIX: ${record.vix_previous_close}`);
    console.log(`  - Par: ${record.par_value}`);
    console.log(`  - Expected Volatility: ${record.expected_volatility}`);

    return {
      success: true,
      date,
      openPrice: parseFloat(record.opening_price),
      vix: parseFloat(record.vix_previous_close),
      par: record.par_value
    };

  } catch (error) {
    console.error('\nError fetching morning data:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  const targetDate = process.argv[2]; // Optional date argument

  fetchMorningData(targetDate)
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

module.exports = { fetchMorningData };
