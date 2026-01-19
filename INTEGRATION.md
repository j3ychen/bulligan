# Backend-Frontend Integration Guide

This document describes the integration between the Bulligan backend (Express + PostgreSQL) and frontend (React + Vite).

## Architecture Overview

### Backend (Express.js + PostgreSQL)
- **Location**: `/backend`
- **Port**: 5000 (configurable via PORT env variable)
- **Database**: PostgreSQL with comprehensive schema

### Frontend (React + Vite)
- **Location**: `/frontend`
- **Port**: 5173 (Vite default dev server)
- **API Base URL**: `http://localhost:5000/api` (configurable via VITE_API_BASE_URL)

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Market Data (`/api/market`)
- `GET /api/market/today` - Get today's market data
- `GET /api/market/date/:date` - Get market data by date
- `GET /api/market/range?startDate=&endDate=` - Get market data range

### Predictions (`/api/predictions`)
- `POST /api/predictions` - Submit/update prediction
- `GET /api/predictions/today` - Get today's prediction
- `GET /api/predictions/:date` - Get prediction by date

### Profile (`/api/profile`)
- `GET /api/profile/stats` - Get user statistics
- `GET /api/profile/monthly?year=&month=` - Get monthly performance

### Leaderboard (`/api/leaderboard`)
- `GET /api/leaderboard/monthly?year=&month=` - Get monthly leaderboard
- `GET /api/leaderboard/weekly?year=&week=` - Get weekly leaderboard
- `GET /api/leaderboard/rank/monthly?year=&month=` - Get user's monthly rank

### History (`/api/history`)
- `GET /api/history?limit=&offset=` - Get user prediction history
- `GET /api/history/mulligans` - Get mulligan status
- `GET /api/history/best` - Get best performances

## Frontend Services

All API calls are centralized in service modules:

- **api.js**: Base API client with authentication
- **authService.js**: Authentication operations
- **marketService.js**: Market data operations
- **predictionService.js**: Prediction operations
- **profileService.js**: User profile operations
- **leaderboardService.js**: Leaderboard operations
- **historyService.js**: History operations

## Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Backend returns JWT token
3. Token stored in localStorage via `api.setToken()`
4. All subsequent API calls include token in `Authorization: Bearer <token>` header
5. Backend validates token via `authenticateToken` middleware

## Environment Variables

### Backend (`.env`)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bulligan
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development Setup

### Backend
```bash
cd backend
npm install
# Set up PostgreSQL database and run schema.sql
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Connected Pages

The following frontend pages are now connected to the backend:

1. **PredictionPage** - Submit/update daily predictions, view market data
2. **ProfilePage** - View user stats, recent scores, monthly performance
3. **LeaderboardPage** - View monthly/weekly leaderboards
4. **HistoryPage** - View prediction history and mulligan status

## Database Schema

The PostgreSQL schema includes:

- `users` - User profiles with authentication
- `daily_market_data` - S&P 500 and VIX data
- `predictions` - User daily predictions
- `scores` - Calculated golf scores
- `monthly_rounds` - Monthly competition tracking
- `user_round_stats` - User performance per month
- `weekly_tournaments` - Weekly tournaments
- `user_tournament_stats` - User weekly performance
- `friendships` - Social features
- `notifications` - User notifications

## Next Steps

To make this fully functional:

1. Set up PostgreSQL database
2. Run the schema SQL file to create tables
3. Create a data seeding script to populate market data
4. Implement market data fetching from external API
5. Add authentication UI (login/register pages)
6. Implement scoring calculation job
7. Add error boundaries and better error handling
8. Add loading states and optimistic updates
9. Implement real-time features (WebSockets)
10. Add testing (unit tests, integration tests, E2E tests)
