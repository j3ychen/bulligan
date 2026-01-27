// Eastern Time utilities for Bulligan scheduling

// Get current time in Eastern Time
function getETTime() {
  return new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
}

// Get current Date object in Eastern Time
function getETDate() {
  return new Date(getETTime());
}

// Get today's date in YYYY-MM-DD format (Eastern Time)
function getTodayET() {
  const et = getETDate();
  return et.toISOString().split('T')[0];
}

// Get current hour in Eastern Time (0-23)
function getCurrentHourET() {
  return getETDate().getHours();
}

// Get current minute in Eastern Time (0-59)
function getCurrentMinuteET() {
  return getETDate().getMinutes();
}

// Check if prediction window is open (before 11 AM ET)
function isPredictionWindowOpen() {
  return getCurrentHourET() < 11;
}

// Check if mulligan window is open (11 AM - 2 PM ET)
function isMulliganWindowOpen() {
  const hour = getCurrentHourET();
  return hour >= 11 && hour < 14;
}

// Check if results should be revealed (after 4 PM ET)
function isAfterMarketClose() {
  return getCurrentHourET() >= 16;
}

// Check if market is open (9:30 AM - 4:00 PM ET on trading days)
function isMarketOpen() {
  const et = getETDate();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // 9:30 AM = 570 minutes, 4:00 PM = 960 minutes
  return timeInMinutes >= 570 && timeInMinutes < 960;
}

// Format date for logging
function formatDateTimeET(date = new Date()) {
  const options = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return new Date(date).toLocaleString('en-US', options) + ' ET';
}

// Parse a date string and return Date in ET context
function parseDateET(dateString) {
  // dateString is expected in YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date at noon ET to avoid timezone issues
  const date = new Date(`${dateString}T12:00:00-05:00`);
  return date;
}

module.exports = {
  getETTime,
  getETDate,
  getTodayET,
  getCurrentHourET,
  getCurrentMinuteET,
  isPredictionWindowOpen,
  isMulliganWindowOpen,
  isAfterMarketClose,
  isMarketOpen,
  formatDateTimeET,
  parseDateET
};
