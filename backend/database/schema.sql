-- Bulligan Database Schema
-- PostgreSQL 14+

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Overall statistics (cached for performance)
    total_score INTEGER DEFAULT 0,
    total_rounds_played INTEGER DEFAULT 0,
    total_holes_played INTEGER DEFAULT 0,
    career_avg_score DECIMAL(5,2),
    best_round_score INTEGER,
    hole_in_ones INTEGER DEFAULT 0,
    
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
    
    -- VIX data (from previous day's close)
    vix_previous_close DECIMAL(6,2),
    
    -- Par calculation
    par_value INTEGER CHECK (par_value IN (3, 4, 5, 6)),
    
    -- Weather conditions (course difficulty)
    weather_condition VARCHAR(20),
    difficulty_multiplier DECIMAL(3,2),
    expected_volatility DECIMAL(6,4),
    
    -- Statistics for the day
    avg_player_score DECIMAL(5,2),
    
    -- Metadata
    scores_calculated BOOLEAN DEFAULT false,
    calculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_data_trading_days ON daily_market_data(date) WHERE is_trading_day = true;
CREATE INDEX idx_market_data_uncalculated ON daily_market_data(date) WHERE scores_calculated = false;
CREATE INDEX idx_market_data_weather ON daily_market_data(date, weather_condition);

-- ============================================
-- PREDICTIONS TABLE
-- ============================================
CREATE TABLE predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL REFERENCES daily_market_data(date),
    
    -- Prediction details
    predicted_close_value DECIMAL(10,2) NOT NULL,
    predicted_change_pct DECIMAL(6,4),
    
    -- Timing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_edited_at TIMESTAMP WITH TIME ZONE,
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,
    
    -- Track if this was a missed prediction
    is_gentlemans_eight BOOLEAN DEFAULT false,
    
    CONSTRAINT unique_user_date UNIQUE(user_id, date),
    CONSTRAINT reasonable_prediction CHECK (predicted_close_value > 0)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_date ON predictions(date);
CREATE INDEX idx_predictions_user_date ON predictions(user_id, date);
CREATE INDEX idx_predictions_unlocked ON predictions(date) WHERE is_locked = false;

-- ============================================
-- SCORES TABLE
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
    
    -- Golf score name (for display)
    score_name VARCHAR(20),
    is_hole_in_one BOOLEAN DEFAULT false,
    
    -- Special score types
    is_mulligan BOOLEAN DEFAULT false,
    is_gentlemans_eight BOOLEAN DEFAULT false,
    original_score_id UUID REFERENCES scores(score_id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_score_per_user_date UNIQUE(user_id, date)
);

CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_date ON scores(date);
CREATE INDEX idx_scores_user_date ON scores(user_id, date);
CREATE INDEX idx_scores_hole_in_ones ON scores(user_id) WHERE is_hole_in_one = true;
CREATE INDEX idx_scores_mulligans ON scores(user_id) WHERE is_mulligan = true;
CREATE INDEX idx_scores_gentlemans ON scores(user_id) WHERE is_gentlemans_eight = true;

-- ============================================
-- MONTHLY ROUNDS TABLE
-- ============================================
CREATE TABLE monthly_rounds (
    round_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Statistics
    total_holes INTEGER,
    is_complete BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_year_month UNIQUE(year, month)
);

CREATE INDEX idx_rounds_year_month ON monthly_rounds(year, month);
CREATE INDEX idx_rounds_active ON monthly_rounds(year, month) WHERE is_complete = false;

-- ============================================
-- USER ROUND STATS TABLE
-- ============================================
CREATE TABLE user_round_stats (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES monthly_rounds(round_id) ON DELETE CASCADE,
    
    -- Performance metrics
    total_score INTEGER DEFAULT 0,
    holes_played INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    
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
    
    -- Weather performance
    perfect_days_score INTEGER DEFAULT 0,
    perfect_days_played INTEGER DEFAULT 0,
    weather_event_score INTEGER DEFAULT 0,
    weather_event_days_played INTEGER DEFAULT 0,
    
    -- Mulligan tracking
    mulligans_remaining INTEGER DEFAULT 1,
    mulligans_used INTEGER DEFAULT 0,
    
    -- Best performance
    best_hole_score INTEGER,
    
    -- Metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_round UNIQUE(user_id, round_id)
);

CREATE INDEX idx_user_round_stats_user ON user_round_stats(user_id);
CREATE INDEX idx_user_round_stats_round ON user_round_stats(round_id);
CREATE INDEX idx_user_round_leaderboard ON user_round_stats(round_id, total_score, holes_played);

-- ============================================
-- WEEKLY TOURNAMENTS TABLE
-- ============================================
CREATE TABLE weekly_tournaments (
    tournament_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    
    -- Date range (Monday-Friday)
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Statistics
    total_holes INTEGER,
    is_complete BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_year_week UNIQUE(year, week_number)
);

CREATE INDEX idx_tournaments_year_week ON weekly_tournaments(year, week_number);

-- ============================================
-- USER TOURNAMENT STATS TABLE
-- ============================================
CREATE TABLE user_tournament_stats (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES weekly_tournaments(tournament_id) ON DELETE CASCADE,
    
    -- Performance metrics
    total_score INTEGER DEFAULT 0,
    holes_played INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    
    -- Metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_tournament UNIQUE(user_id, tournament_id)
);

CREATE INDEX idx_user_tournament_stats_user ON user_tournament_stats(user_id);
CREATE INDEX idx_user_tournament_stats_tournament ON user_tournament_stats(tournament_id);
CREATE INDEX idx_user_tournament_leaderboard ON user_tournament_stats(tournament_id, total_score);

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE friendships (
    friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent self-friendship and duplicate relationships
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_accepted ON friendships(user_id, friend_id) WHERE status = 'accepted';
CREATE INDEX idx_friendships_pending ON friendships(friend_id) WHERE status = 'pending';

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

-- Function to calculate par from VIX
CREATE OR REPLACE FUNCTION calculate_par_from_vix(vix DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN vix < 16 THEN 3
        WHEN vix < 20 THEN 4
        WHEN vix < 25 THEN 5
        ELSE 6
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;