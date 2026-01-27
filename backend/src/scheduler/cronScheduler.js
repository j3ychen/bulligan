// Cron Scheduler - Central job configuration for Bulligan

const cron = require('node-cron');
const { fetchMorningData } = require('../scripts/fetchMorningData');
const { lockPredictions } = require('../scripts/lockPredictions');
const { calculateScores } = require('../scripts/calculateScores');
const { formatDateTimeET } = require('../utils/timezone');

// Store active cron jobs for management
const jobs = {};

/**
 * Initialize all scheduled jobs
 * Schedule runs in Eastern Time (America/New_York)
 */
function initializeScheduler() {
  console.log(`[${formatDateTimeET()}] Initializing Bulligan scheduler...`);

  // Job 1: Fetch Morning Data - 9:30 AM ET on weekdays
  // Cron: minute hour day-of-month month day-of-week
  // Note: node-cron uses local timezone, so we schedule based on server time
  // For production, ensure server is in ET or use timezone option
  jobs.morningData = cron.schedule('30 9 * * 1-5', async () => {
    console.log(`\n[CRON] Morning data fetch triggered at ${formatDateTimeET()}`);
    try {
      const result = await fetchMorningData();
      console.log(`[CRON] Morning data result:`, result.success ? 'Success' : 'Failed');
    } catch (error) {
      console.error('[CRON] Morning data error:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  // Job 2: Lock Predictions - 11:00 AM ET on weekdays
  jobs.lockPredictions = cron.schedule('0 11 * * 1-5', async () => {
    console.log(`\n[CRON] Lock predictions triggered at ${formatDateTimeET()}`);
    try {
      const result = await lockPredictions();
      console.log(`[CRON] Lock predictions result:`, result.success ? 'Success' : 'Failed');
    } catch (error) {
      console.error('[CRON] Lock predictions error:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  // Job 3: Calculate Scores - 4:05 PM ET on weekdays (5 min after market close)
  jobs.calculateScores = cron.schedule('5 16 * * 1-5', async () => {
    console.log(`\n[CRON] Calculate scores triggered at ${formatDateTimeET()}`);
    try {
      const result = await calculateScores();
      console.log(`[CRON] Calculate scores result:`, result.success ? 'Success' : 'Failed');
    } catch (error) {
      console.error('[CRON] Calculate scores error:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  console.log(`Scheduled jobs:`);
  console.log(`  - Morning data fetch: 9:30 AM ET (Mon-Fri)`);
  console.log(`  - Lock predictions:   11:00 AM ET (Mon-Fri)`);
  console.log(`  - Calculate scores:   4:05 PM ET (Mon-Fri)`);
  console.log(`[${formatDateTimeET()}] Scheduler initialized successfully\n`);

  return jobs;
}

/**
 * Stop all scheduled jobs
 */
function stopScheduler() {
  console.log(`[${formatDateTimeET()}] Stopping scheduler...`);

  Object.keys(jobs).forEach(jobName => {
    if (jobs[jobName]) {
      jobs[jobName].stop();
      console.log(`  - Stopped ${jobName}`);
    }
  });

  console.log(`[${formatDateTimeET()}] Scheduler stopped\n`);
}

/**
 * Get status of all jobs
 * @returns {object} - Job statuses
 */
function getSchedulerStatus() {
  const status = {};

  Object.keys(jobs).forEach(jobName => {
    status[jobName] = jobs[jobName] ? 'Running' : 'Stopped';
  });

  return status;
}

/**
 * Manually trigger a specific job
 * @param {string} jobName - Name of job to trigger
 */
async function triggerJob(jobName) {
  console.log(`[${formatDateTimeET()}] Manually triggering job: ${jobName}`);

  switch (jobName) {
    case 'morningData':
      return await fetchMorningData();
    case 'lockPredictions':
      return await lockPredictions();
    case 'calculateScores':
      return await calculateScores();
    default:
      throw new Error(`Unknown job: ${jobName}`);
  }
}

module.exports = {
  initializeScheduler,
  stopScheduler,
  getSchedulerStatus,
  triggerJob,
  jobs
};
