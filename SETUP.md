# Bulligan Setup Guide

Complete setup instructions to get Bulligan running locally.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm installed
- **PostgreSQL** 14+ installed and running
- **Git** installed

## Quick Start (5 minutes)

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE bulligan;
CREATE USER bulligan_user WITH PASSWORD 'bulligan_password';
GRANT ALL PRIVILEGES ON DATABASE bulligan TO bulligan_user;
\q
```

### 3. Clone and Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_NAME=bulligan
# DB_USER=bulligan_user
# DB_PASSWORD=bulligan_password
# DB_HOST=localhost
# DB_PORT=5432
# JWT_SECRET=your-secret-key-here

# Initialize database and seed data
npm run setup
```

This will:
- Create all database tables from schema.sql
- Generate 30 days of sample market data
- Create 4 demo users
- Generate sample predictions and scores
- Calculate leaderboard stats

### 4. Setup Frontend

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file (already exists from integration)
# VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### 6. Login and Test

Open http://localhost:5173 in your browser.

**Demo Credentials:**
- Username: `demo_user`
- Password: `password123`

Other test users: `MarketMaster`, `BullRunner`, `EagleEye` (all with password: `password123`)

## Database Scripts

### Initialize Database
Creates all tables from schema.sql:
```bash
npm run init-db
```

### Seed Sample Data
Populates database with sample users, market data, and predictions:
```bash
npm run seed
```

### Complete Setup
Initialize + Seed in one command:
```bash
npm run setup
```

### Reset Database
⚠️ WARNING: Drops all tables and data:
```bash
npm run reset-db
```

## What Gets Seeded

### Market Data
- **30 days** of historical S&P 500 data
- **1 day** of "today" with opening price only (for predictions)
- Realistic price movements and volatility (VIX)
- Dynamic Par values based on VIX (Par 3-6)
- Weather conditions (Perfect, Fog, Thunderstorm)

### Users
- 4 demo users with bcrypt-hashed passwords
- Ready to login immediately

### Predictions & Scores
- 10-20 predictions per user for past days
- Golf scores calculated based on prediction accuracy
- Various score types: Birdies, Eagles, Pars, Bogeys
- Some Hole-in-ones for perfect predictions

### Leaderboards
- Monthly round stats for current month
- User performance rankings
- Score distribution (birdies, eagles, etc.)
- Mulligan tracking (1 per user per month)

## Project Structure

```
bulligan/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # DB connection pool
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── marketController.js
│   │   │   ├── predictionController.js
│   │   │   ├── profileController.js
│   │   │   ├── leaderboardController.js
│   │   │   └── historyController.js
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.js
│   │   │   ├── market.js
│   │   │   ├── predictions.js
│   │   │   ├── profile.js
│   │   │   ├── leaderboard.js
│   │   │   └── history.js
│   │   └── server.js                # Express app
│   ├── database/
│   │   └── schema.sql               # PostgreSQL schema
│   ├── scripts/
│   │   ├── initDatabase.js          # Initialize DB
│   │   ├── seedData.js              # Seed sample data
│   │   └── resetDatabase.js         # Reset DB
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navigation.jsx
    │   ├── pages/                   # UI Pages
    │   │   ├── LandingPage.jsx
    │   │   ├── PredictionPage.jsx   # Connected to API
    │   │   ├── ProfilePage.jsx      # Connected to API
    │   │   ├── LeaderboardPage.jsx  # Connected to API
    │   │   ├── HistoryPage.jsx      # Connected to API
    │   │   └── ...
    │   ├── services/                # API service layer
    │   │   ├── api.js               # HTTP client
    │   │   ├── authService.js
    │   │   ├── marketService.js
    │   │   ├── predictionService.js
    │   │   ├── profileService.js
    │   │   ├── leaderboardService.js
    │   │   └── historyService.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## API Endpoints

See [INTEGRATION.md](./INTEGRATION.md) for complete API documentation.

## Troubleshooting

### Database Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list               # macOS

# Check your .env file has correct credentials
```

### Port Already in Use
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Tables Already Exist
```bash
# Reset and reinitialize
cd backend
npm run reset-db
npm run setup
```

### No Market Data for Today
The seed script creates today's date with only opening price (no closing yet). This is intentional so you can submit predictions. To see full functionality:
- Use yesterday's date in PredictionPage
- Or wait until 4:00 PM ET when markets close
- Or manually add closing price in database

### Login Not Working
Make sure you:
1. Ran `npm run seed` to create users
2. Using correct credentials: `demo_user` / `password123`
3. Backend is running on port 5000
4. Check browser console for errors

## Next Steps

After setup, you can:

1. **Explore the UI** - Visit all pages to see the data
2. **Make Predictions** - Submit a prediction for today
3. **Check Leaderboard** - See how users rank
4. **View History** - Look at past predictions and scores
5. **Customize Data** - Edit `seedData.js` to change sample data
6. **Add Real Data** - Integrate with financial APIs for live market data

## Production Deployment

For production:

1. Use strong JWT_SECRET in .env
2. Set up proper PostgreSQL credentials
3. Enable PostgreSQL SSL
4. Set NODE_ENV=production
5. Use a process manager (PM2)
6. Set up proper CORS origins
7. Enable HTTPS
8. Regular database backups
9. Monitor logs and errors
10. Set up CI/CD pipeline

## Need Help?

- Check [INTEGRATION.md](./INTEGRATION.md) for API details
- See database schema in `backend/database/schema.sql`
- Review game rules in frontend's HowToPlayPage

## License

ISC
