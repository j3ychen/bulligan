const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const predictionRoutes = require('./routes/predictions');
const profileRoutes = require('./routes/profile');
const leaderboardRoutes = require('./routes/leaderboard');
const historyRoutes = require('./routes/history');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Bulligan API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      market: '/api/market',
      predictions: '/api/predictions',
      profile: '/api/profile',
      leaderboard: '/api/leaderboard',
      history: '/api/history',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/history', historyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});