-- Bulligan Database Schema
-- Based on Final Game Design Document

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,

    -- Overall statistics
    total_days_played INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2) DEFAULT 0,
    best_score INTEGER,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    -- Mulligan tracking
    mulligans_available INTEGER DEFAULT 0 CHECK (mulligans_available BETWEEN 0 AND 2),
    mulligans_earned_total INTEGER DEFAULT 0,
    mulligans_used_total INTEGER DEFAULT 0,

    -- Score distribution
    hole_in_ones INTEGER DEFAULT 0,
    condors INTEGER DEFAULT 0,
    albatrosses INTEGER DEFAULT 0,
    eagles INTEGER DEFAULT 0,
    birdies INTEGER DEFAULT 0,
    pars INTEGER DEFAULT 0,
    bogeys INTEGER DEFAULT 0,
    double_bogeys INTEGER DEFAULT 0,
    triple_bogeys INTEGER DEFAULT 0,
    worse INTEGER DEFAULT 0,

    CONSTRAINT valid_username CHECK (char_length(username) >= 3)
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. DAILY MARKET DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_market_data (
    date DATE PRIMARY KEY,
    is_trading_day BOOLEAN NOT NULL DEFAULT true,

    -- S&P 500 data
    opening_price DECIMAL(10,2),
    closing_price DECIMAL(10,2),
    actual_change_pct DECIMAL(6,4),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),

    -- VIX data (from previous day close)
    vix_previous_close DECIMAL(6,2),

    -- Par calculation
    par_value INTEGER CHECK (par_value IN (3, 4, 5, 6)),

    -- Weather condition (determined after close)
    weather_condition VARCHAR(20) CHECK (weather_condition IN ('perfect', 'fog', 'thunderstorm', 'tornado')),
    expected_volatility DECIMAL(6,4),

    -- Metadata
    scores_calculated BOOLEAN DEFAULT false,
    calculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_market_data_date ON daily_market_data(date DESC);

-- ============================================
-- 3. PREDICTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Prediction details
    predicted_close_value DECIMAL(10,2) NOT NULL,
    predicted_change_pct DECIMAL(6,4),

    -- Timing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_edited_at TIMESTAMP WITH TIME ZONE,
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,

    -- Mulligan tracking
    is_mulligan BOOLEAN DEFAULT false,
    mulligan_submitted_at TIMESTAMP WITH TIME ZONE,
    original_prediction DECIMAL(10,2),

    CONSTRAINT unique_user_date UNIQUE(user_id, date),
    CONSTRAINT reasonable_prediction CHECK (predicted_close_value > 0)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(date DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_user_date ON predictions(user_id, date);

-- ============================================
-- 4. SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
    score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Scoring details
    strokes INTEGER NOT NULL CHECK (strokes BETWEEN 1 AND 8),
    par INTEGER NOT NULL CHECK (par IN (3, 4, 5, 6)),
    golf_score INTEGER NOT NULL, -- strokes - par
    deviation_pct DECIMAL(6,4),
    score_name VARCHAR(20),
    is_hole_in_one BOOLEAN DEFAULT false,

    -- Mulligan tracking
    used_mulligan BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_score_per_user_date UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON scores(user_id, date);
CREATE INDEX IF NOT EXISTS idx_scores_golf_score ON scores(golf_score);

-- ============================================
-- 5. FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
    friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Simple add (no request/accept flow per design)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent self-friendship and duplicate relationships
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate Par from VIX (per updated design: 16-21 for Par 4)
CREATE OR REPLACE FUNCTION calculate_par_from_vix(vix DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN vix < 16 THEN 3   -- Very calm
        WHEN vix < 21 THEN 4   -- Normal (updated from 20)
        WHEN vix < 25 THEN 5   -- Elevated (updated from 20-25)
        ELSE 6                  -- High volatility
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate Strokes from Deviation Percentage
CREATE OR REPLACE FUNCTION calculate_strokes(deviation_pct DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN ABS(deviation_pct) <= 0.1 THEN 1
        WHEN ABS(deviation_pct) <= 0.25 THEN 2
        WHEN ABS(deviation_pct) <= 0.5 THEN 3
        WHEN ABS(deviation_pct) <= 1.0 THEN 4
        WHEN ABS(deviation_pct) <= 2.0 THEN 5
        WHEN ABS(deviation_pct) <= 3.0 THEN 6
        WHEN ABS(deviation_pct) <= 5.0 THEN 7
        ELSE 8
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get Golf Score Name
CREATE OR REPLACE FUNCTION get_golf_score_name(golf_score INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN CASE
        WHEN golf_score <= -4 THEN 'Condor'
        WHEN golf_score = -3 THEN 'Albatross'
        WHEN golf_score = -2 THEN 'Eagle'
        WHEN golf_score = -1 THEN 'Birdie'
        WHEN golf_score = 0 THEN 'Par'
        WHEN golf_score = 1 THEN 'Bogey'
        WHEN golf_score = 2 THEN 'Double Bogey'
        WHEN golf_score = 3 THEN 'Triple Bogey'
        ELSE 'Quadruple Bogey'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate Weather Condition based on actual vs expected volatility
CREATE OR REPLACE FUNCTION calculate_weather(actual_change DECIMAL, expected_volatility DECIMAL)
RETURNS VARCHAR(20) AS $$
DECLARE
    ratio DECIMAL;
BEGIN
    IF expected_volatility = 0 THEN
        expected_volatility := 0.5; -- Default if not set
    END IF;

    ratio := ABS(actual_change) / expected_volatility;

    RETURN CASE
        WHEN ratio <= 1.0 THEN 'perfect'
        WHEN ratio <= 1.5 THEN 'fog'
        WHEN ratio <= 2.0 THEN 'thunderstorm'
        ELSE 'tornado'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
