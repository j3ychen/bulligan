// Scoring utility functions matching the game design

// Calculate Par from VIX (per updated design: 16-21 for Par 4)
function calculateParFromVix(vix) {
  if (vix < 16) return 3;    // Very calm
  if (vix < 21) return 4;    // Normal (updated from 20)
  if (vix < 25) return 5;    // Elevated (updated from 20-25)
  return 6;                   // High volatility
}

// Calculate Strokes from Deviation Percentage
function calculateStrokes(deviationPct) {
  const absDeviation = Math.abs(deviationPct);
  if (absDeviation <= 0.1) return 1;
  if (absDeviation <= 0.25) return 2;
  if (absDeviation <= 0.5) return 3;
  if (absDeviation <= 1.0) return 4;
  if (absDeviation <= 2.0) return 5;
  if (absDeviation <= 3.0) return 6;
  if (absDeviation <= 5.0) return 7;
  return 8;
}

// Calculate deviation percentage
function calculateDeviationPct(predicted, actual) {
  return ((predicted - actual) / actual) * 100;
}

// Get Golf Score Name
function getGolfScoreName(golfScore) {
  if (golfScore <= -4) return 'Condor';
  if (golfScore === -3) return 'Albatross';
  if (golfScore === -2) return 'Eagle';
  if (golfScore === -1) return 'Birdie';
  if (golfScore === 0) return 'Par';
  if (golfScore === 1) return 'Bogey';
  if (golfScore === 2) return 'Double Bogey';
  if (golfScore === 3) return 'Triple Bogey';
  return 'Quadruple Bogey';
}

// Get score distribution category for updating user stats
function getScoreCategory(golfScore, par, strokes) {
  // Check for hole in one (1 stroke on Par 3)
  if (strokes === 1 && par === 3) {
    return 'hole_in_ones';
  }

  if (golfScore <= -4) return 'condors';
  if (golfScore === -3) return 'albatrosses';
  if (golfScore === -2) return 'eagles';
  if (golfScore === -1) return 'birdies';
  if (golfScore === 0) return 'pars';
  if (golfScore === 1) return 'bogeys';
  if (golfScore === 2) return 'double_bogeys';
  if (golfScore === 3) return 'triple_bogeys';
  return 'worse';
}

// Calculate Weather Condition based on actual vs expected volatility
function calculateWeather(actualChangePct, expectedVolatility) {
  if (!expectedVolatility || expectedVolatility === 0) {
    expectedVolatility = 0.5; // Default
  }

  const ratio = Math.abs(actualChangePct) / expectedVolatility;

  if (ratio <= 1.0) return 'perfect';
  if (ratio <= 1.5) return 'fog';
  if (ratio <= 2.0) return 'thunderstorm';
  return 'tornado';
}

// Calculate full score for a prediction
function calculateScore(predicted, actual, par) {
  const deviationPct = calculateDeviationPct(predicted, actual);
  const strokes = calculateStrokes(deviationPct);
  const golfScore = strokes - par;
  const scoreName = getGolfScoreName(golfScore);
  const isHoleInOne = strokes === 1 && par === 3;
  const category = getScoreCategory(golfScore, par, strokes);

  return {
    deviationPct: Math.round(deviationPct * 10000) / 10000, // 4 decimal places
    strokes,
    golfScore,
    scoreName,
    isHoleInOne,
    category
  };
}

module.exports = {
  calculateParFromVix,
  calculateStrokes,
  calculateDeviationPct,
  getGolfScoreName,
  getScoreCategory,
  calculateWeather,
  calculateScore
};
