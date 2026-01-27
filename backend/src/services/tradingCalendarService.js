// Trading Calendar Service - NYSE holidays and trading day logic

// NYSE Holidays for 2026
// Source: NYSE holiday schedule
const NYSE_HOLIDAYS_2026 = [
  '2026-01-01', // New Year's Day
  '2026-01-19', // Martin Luther King Jr. Day
  '2026-02-16', // Presidents' Day
  '2026-04-03', // Good Friday
  '2026-05-25', // Memorial Day
  '2026-07-03', // Independence Day (observed)
  '2026-09-07', // Labor Day
  '2026-11-26', // Thanksgiving Day
  '2026-12-25', // Christmas Day
];

// Early close days (1 PM ET) - market closes early but still a trading day
const NYSE_EARLY_CLOSE_2026 = [
  '2026-11-27', // Day after Thanksgiving
  '2026-12-24', // Christmas Eve
];

// Create a Set for faster lookups
const holidaySet = new Set(NYSE_HOLIDAYS_2026);
const earlyCloseSet = new Set(NYSE_EARLY_CLOSE_2026);

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isWeekend(date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is an NYSE holiday
 * @param {Date|string} date - Date to check (YYYY-MM-DD string or Date object)
 * @returns {boolean}
 */
function isNYSEHoliday(date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return holidaySet.has(dateStr);
}

/**
 * Check if a date is an early close day
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isEarlyCloseDay(date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return earlyCloseSet.has(dateStr);
}

/**
 * Check if a given date is a trading day
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
function isTradingDay(date) {
  return !isWeekend(date) && !isNYSEHoliday(date);
}

/**
 * Get the previous trading day from a given date
 * @param {Date|string} date - Starting date
 * @returns {string} - Previous trading day in YYYY-MM-DD format
 */
function getPreviousTradingDay(date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : new Date(date);

  // Start from the previous day
  d.setDate(d.getDate() - 1);

  // Keep going back until we find a trading day
  while (!isTradingDay(d)) {
    d.setDate(d.getDate() - 1);
  }

  return d.toISOString().split('T')[0];
}

/**
 * Get the next trading day from a given date
 * @param {Date|string} date - Starting date
 * @returns {string} - Next trading day in YYYY-MM-DD format
 */
function getNextTradingDay(date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : new Date(date);

  // Start from the next day
  d.setDate(d.getDate() + 1);

  // Keep going forward until we find a trading day
  while (!isTradingDay(d)) {
    d.setDate(d.getDate() + 1);
  }

  return d.toISOString().split('T')[0];
}

/**
 * Get trading days in a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {string[]} - Array of trading days
 */
function getTradingDaysInRange(startDate, endDate) {
  const tradingDays = [];
  const current = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');

  while (current <= end) {
    if (isTradingDay(current)) {
      tradingDays.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  return tradingDays;
}

/**
 * Get market close time for a given date
 * @param {Date|string} date - Date to check
 * @returns {object} - { hour, minute } in ET
 */
function getMarketCloseTime(date) {
  if (isEarlyCloseDay(date)) {
    return { hour: 13, minute: 0 }; // 1:00 PM ET
  }
  return { hour: 16, minute: 0 }; // 4:00 PM ET
}

/**
 * Get all holidays for a year
 * @param {number} year - Year (currently only 2026 supported)
 * @returns {string[]}
 */
function getHolidaysForYear(year) {
  if (year === 2026) {
    return [...NYSE_HOLIDAYS_2026];
  }
  console.warn(`Holidays for year ${year} not configured, using 2026 holidays`);
  return [...NYSE_HOLIDAYS_2026];
}

module.exports = {
  isTradingDay,
  isWeekend,
  isNYSEHoliday,
  isEarlyCloseDay,
  getPreviousTradingDay,
  getNextTradingDay,
  getTradingDaysInRange,
  getMarketCloseTime,
  getHolidaysForYear,
  NYSE_HOLIDAYS_2026,
  NYSE_EARLY_CLOSE_2026
};
