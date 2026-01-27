// Market Data Service - Yahoo Finance API wrapper for S&P 500 and VIX data

const yahooFinance = require('yahoo-finance2').default;
const { getPreviousTradingDay } = require('./tradingCalendarService');

// Symbols
const SP500_SYMBOL = '^GSPC';
const VIX_SYMBOL = '^VIX';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get cached data if valid
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null
 */
function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

/**
 * Set cache data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear the cache
 */
function clearCache() {
  cache.clear();
}

/**
 * Fetch data with retry logic
 * @param {Function} fetchFn - Async function to fetch data
 * @param {string} description - Description for logging
 * @returns {Promise<any>}
 */
async function fetchWithRetry(fetchFn, description) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      console.error(`${description} - Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Get current S&P 500 quote (real-time or delayed)
 * @returns {Promise<object>} - Quote data with price, open, high, low
 */
async function getSP500Quote() {
  const cacheKey = `sp500_quote`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await fetchWithRetry(async () => {
    const quote = await yahooFinance.quote(SP500_SYMBOL);
    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      previousClose: quote.regularMarketPreviousClose,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketState: quote.marketState,
      fetchedAt: new Date().toISOString()
    };
  }, 'Fetch S&P 500 quote');

  setCache(cacheKey, data);
  return data;
}

/**
 * Get S&P 500 open price for today
 * @returns {Promise<number>}
 */
async function getSP500Open() {
  const quote = await getSP500Quote();
  return quote.open;
}

/**
 * Get S&P 500 close price (only valid after market close)
 * @returns {Promise<number>}
 */
async function getSP500Close() {
  const quote = await getSP500Quote();
  return quote.price; // Current price becomes close after market
}

/**
 * Get current VIX quote
 * @returns {Promise<object>} - VIX data
 */
async function getVIXQuote() {
  const cacheKey = `vix_quote`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await fetchWithRetry(async () => {
    const quote = await yahooFinance.quote(VIX_SYMBOL);
    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      fetchedAt: new Date().toISOString()
    };
  }, 'Fetch VIX quote');

  setCache(cacheKey, data);
  return data;
}

/**
 * Get VIX previous day close (used for par calculation)
 * @returns {Promise<number>}
 */
async function getVIXPreviousClose() {
  const quote = await getVIXQuote();
  return quote.previousClose;
}

/**
 * Get historical data for a symbol
 * @param {string} symbol - Stock symbol
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object|null>} - Historical data or null
 */
async function getHistoricalData(symbol, date) {
  const cacheKey = `historical_${symbol}_${date}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await fetchWithRetry(async () => {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    if (!historical || historical.length === 0) {
      return null;
    }

    const dayData = historical[0];
    return {
      date: date,
      open: dayData.open,
      high: dayData.high,
      low: dayData.low,
      close: dayData.close,
      volume: dayData.volume
    };
  }, `Fetch historical data for ${symbol} on ${date}`);

  if (data) {
    setCache(cacheKey, data);
  }
  return data;
}

/**
 * Get S&P 500 historical data for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object|null>}
 */
async function getSP500Historical(date) {
  return getHistoricalData(SP500_SYMBOL, date);
}

/**
 * Get VIX close for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number|null>}
 */
async function getVIXHistoricalClose(date) {
  const data = await getHistoricalData(VIX_SYMBOL, date);
  return data ? data.close : null;
}

/**
 * Get all market data needed for morning fetch
 * @returns {Promise<object>}
 */
async function getMorningData() {
  const [sp500Quote, vixQuote] = await Promise.all([
    getSP500Quote(),
    getVIXQuote()
  ]);

  return {
    sp500: {
      open: sp500Quote.open,
      previousClose: sp500Quote.previousClose
    },
    vix: {
      previousClose: vixQuote.previousClose
    },
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Get all market data needed for scoring (after market close)
 * @returns {Promise<object>}
 */
async function getClosingData() {
  const sp500Quote = await getSP500Quote();

  return {
    sp500: {
      open: sp500Quote.open,
      close: sp500Quote.price,
      high: sp500Quote.high,
      low: sp500Quote.low,
      changePercent: sp500Quote.changePercent
    },
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Get VIX close from previous trading day
 * @param {string} date - Current date in YYYY-MM-DD format
 * @returns {Promise<number>}
 */
async function getVIXForPar(date) {
  const previousTradingDay = getPreviousTradingDay(date);

  // Try to get historical data first
  const historicalVix = await getVIXHistoricalClose(previousTradingDay);
  if (historicalVix !== null) {
    return historicalVix;
  }

  // Fall back to current quote's previous close
  const vixQuote = await getVIXQuote();
  return vixQuote.previousClose;
}

module.exports = {
  getSP500Quote,
  getSP500Open,
  getSP500Close,
  getVIXQuote,
  getVIXPreviousClose,
  getSP500Historical,
  getVIXHistoricalClose,
  getMorningData,
  getClosingData,
  getVIXForPar,
  clearCache,
  // Export symbols for reference
  SP500_SYMBOL,
  VIX_SYMBOL
};
