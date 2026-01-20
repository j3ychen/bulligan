-- Bulligan Database Schema v2
-- Final Simplified Game Design
-- PostgreSQL 14+

-- ============================================
-- USERS TABLE (Updated with Streaks & Mulligans)
-- ============================================
CREATE TABLE users (
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
    avg_score DECIMAL(5,2),
    best_score INTEGER,

    -- Streak tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_played_date DATE,

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

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- DAILY MARKET DATA TABLE
-- ============================================
CREATE TABLE daily_market_data (
    date DATE PRIMARY KEY,
    is_trading_day BOOLEAN NOT NULL DEFAULT true,

    -- S&P 500 data
    opening_price DECIMAL(10,2),
    closing_price DECIMAL(10,2),
    actual_change_pct DECIMAL(6,4),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),

    -- VIX data (from previous day)
    vix_previous_close DECIMAL(6,2),

    -- Par calculation
    par_value INTEGER CHECK (par_value IN (3, 4, 5, 6)),

    -- Weather condition (informational only)
    weather_condition VARCHAR(20) CHECK (weather_condition IN ('Perfect', 'Fog', 'Thunderstorm', 'Tornado')),
    difficulty_multiplier DECIMAL(3,2),
    expected_volatility DECIMAL(6,4),

    -- Metadata
    avg_player_score DECIMAL(5,2),
    scores_calculated BOOLEAN DEFAULT false,
    calculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_data_trading_days ON daily_market_data(date) WHERE is_trading_day = true;
CREATE INDEX idx_market_data_uncalculated ON daily_market_data(date) WHERE scores_calculated = false;

-- ============================================
-- PREDICTIONS TABLE (Updated for Mulligans)
-- ============================================
CREATE TABLE predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL REFERENCES daily_market_data(date),

    -- Prediction details
    predicted_close_value DECIMAL(10,2) NOT NULL,
    predicted_change_pct DECIMAL(6,4),

    -- Regular prediction timing (before 11:00 AM ET)
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_edited_at TIMESTAMP WITH TIME ZONE,
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,

    -- Mulligan tracking (11:00 AM - 2:00 PM ET)
    is_mulligan BOOLEAN DEFAULT false,
    mulligan_submitted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT unique_user_date UNIQUE(user_id, date),
    CONSTRAINT reasonable_prediction CHECK (predicted_close_value > 0)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_date ON predictions(date);
CREATE INDEX idx_predictions_user_date ON predictions(user_id, date);
CREATE INDEX idx_predictions_unlocked ON predictions(date) WHERE is_locked = false;

-- ============================================
-- SCORES TABLE (Simplified)
-- ============================================
CREATE TABLE scores (
    score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL REFERENCES daily_market_data(date),

    -- Scoring details
    strokes INTEGER NOT NULL CHECK (strokes BETWEEN 1 AND 8),
    par INTEGER NOT NULL CHECK (par IN (3, 4, 5, 6)),
    golf_score INTEGER NOT NULL,
    deviation_pct DECIMAL(6,4),
    score_name VARCHAR(20),
    is_hole_in_one BOOLEAN DEFAULT false,

    -- Mulligan tracking (for badge display)
    is_mulligan BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_score_per_user_date UNIQUE(user_id, date)
);

CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_date ON scores(date);
CREATE INDEX idx_scores_user_date ON scores(user_id, date);
CREATE INDEX idx_scores_hole_in_ones ON scores(user_id) WHERE is_hole_in_one = true;
CREATE INDEX idx_scores_mulligans ON scores(user_id) WHERE is_mulligan = true;

-- ============================================
-- FRIENDSHIPS TABLE (Simplified - Instant Add)
-- ============================================
CREATE TABLE friendships (
    friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Simple instant add (no request/accept flow)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent self-friendship and duplicate relationships
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Notification details
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate golf score name
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

-- Function to calculate strokes from deviation
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

-- Function to calculate par from VIX (UPDATED for new ranges)
CREATE OR REPLACE FUNCTION calculate_par_from_vix(vix DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN vix < 16 THEN 3
        WHEN vix < 21 THEN 4  -- UPDATED from 20
        WHEN vix < 25 THEN 5  -- UPDATED from implicit 25
        ELSE 6
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- Tables REMOVED from v1:
-- - monthly_rounds (no more monthly tournaments)
-- - user_round_stats (no more monthly tracking)
-- - weekly_tournaments (no more weekly tournaments)
-- - user_tournament_stats (no more weekly tracking)
--
-- Changes from v1:
-- - users: Added streak and mulligan tracking
-- - predictions: Simplified mulligan tracking (no is_gentlemans_eight)
-- - scores: Removed is_gentlemans_eight, original_score_id
-- - friendships: Removed status field (instant add)
-- - calculate_par_from_vix: Updated VIX ranges
