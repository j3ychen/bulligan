const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Create new account
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username.toLowerCase(), email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, email, created_at`,
      [username.toLowerCase(), email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login - Login and get JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT user_id, username, email, password_hash, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    const token = generateToken(user.user_id);

    res.json({
      message: 'Login successful',
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // JWT is stateless, so logout is handled client-side by removing the token
  // This endpoint exists for API completeness and potential future token blacklisting
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        user_id, username, email, created_at, last_login,
        total_days_played, total_score, avg_score, best_score,
        current_streak, longest_streak,
        mulligans_available, mulligans_earned_total, mulligans_used_total,
        hole_in_ones, eagles, birdies, pars, bogeys
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      stats: {
        totalDaysPlayed: user.total_days_played,
        totalScore: user.total_score,
        avgScore: parseFloat(user.avg_score) || 0,
        bestScore: user.best_score,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak
      },
      mulligans: {
        available: user.mulligans_available,
        earnedTotal: user.mulligans_earned_total,
        usedTotal: user.mulligans_used_total
      },
      scoreDistribution: {
        holeInOnes: user.hole_in_ones,
        eagles: user.eagles,
        birdies: user.birdies,
        pars: user.pars,
        bogeys: user.bogeys
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;
