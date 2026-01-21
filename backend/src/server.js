const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const dailyRoutes = require('./routes/daily');
const friendsRoutes = require('./routes/friends');
const leaderboardRoutes = require('./routes/leaderboard');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Bulligan API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      daily: '/api/daily',
      friends: '/api/friends',
      leaderboard: '/api/leaderboard',
      users: '/api/users'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Bulligan API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
