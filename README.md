# Bulligan

A daily stock market prediction game with golf-themed scoring. Predict where the S&P 500 will close, earn golf scores based on your accuracy, and compete with friends.

## How It Works

1. **Predict** - Submit your S&P 500 closing price prediction before 11:00 AM ET
2. **Score** - At 4:00 PM ET, your prediction accuracy is converted to golf strokes
3. **Compete** - Compare scores with friends or climb the global leaderboard

### Scoring System

Your prediction accuracy determines your strokes:

| Deviation | Strokes |
|-----------|---------|
| ≤ 0.1%    | 1       |
| 0.1-0.25% | 2       |
| 0.25-0.5% | 3       |
| 0.5-1.0%  | 4       |
| 1.0-2.0%  | 5       |
| 2.0-3.0%  | 6       |
| 3.0-5.0%  | 7       |
| > 5.0%    | 8       |

### Dynamic Par

Par changes daily based on market volatility (VIX):

| VIX Range | Par | Condition |
|-----------|-----|-----------|
| 0-16      | 3   | Very calm |
| 16-21     | 4   | Normal    |
| 21-25     | 5   | Elevated  |
| 25+       | 6   | High volatility |

**Golf Score = Strokes - Par** (lower is better!)

### Mulligans

Earn do-overs through consistent play:
- Play 5 consecutive trading days to earn 1 mulligan
- Store up to 2 mulligans at a time
- Use between 11:00 AM - 2:00 PM ET to replace your locked prediction

## Tech Stack

**Frontend**
- React 19 with Vite
- React Router v7
- Tailwind CSS
- Lucide React icons

**Backend**
- Express.js 5
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- node-cron for scheduled jobs
- yahoo-finance2 for market data

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bulligan.git
cd bulligan
```

2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up the database

Create a PostgreSQL database, then configure the connection:
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

Initialize the database:
```bash
npm run db:init
```

4. Start the development servers
```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Automated Scoring System

The backend includes automated jobs that fetch market data and calculate scores daily.

### Scheduled Jobs

| Time (ET) | Job | Description |
|-----------|-----|-------------|
| 9:30 AM | Morning Data | Fetches S&P 500 opening price and VIX, calculates daily par |
| 11:00 AM | Lock Predictions | Locks all predictions for the day (no more edits) |
| 4:05 PM | Calculate Scores | Fetches closing price, calculates all scores, updates streaks |

### Manual Job Execution

Run jobs manually for testing or backfilling:

```bash
cd backend

# Fetch morning data (run after 9:30 AM ET)
npm run job:morning

# Lock predictions (run after 11:00 AM ET)
npm run job:lock

# Calculate scores (run after 4:00 PM ET)
npm run job:score

# Backfill scores for a specific date
npm run job:score-date -- --date 2026-01-24

# Force recalculate (even if already done)
npm run job:score-date -- --date 2026-01-24 --force

# Override closing price
npm run job:score-date -- --date 2026-01-24 --close 5985.50
```

### Scheduler Configuration

The scheduler is enabled by default. To disable it:

```bash
# In .env
ENABLE_SCHEDULER=false
```

When disabled, you can still run jobs manually using the npm scripts above.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Daily Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/daily/today` | Today's market data & prediction status |
| POST | `/api/daily/predict` | Submit prediction (before 11 AM) |
| POST | `/api/daily/mulligan` | Use mulligan (11 AM - 2 PM) |
| GET | `/api/daily/result/:date` | Get results for a date |
| GET | `/api/daily/history` | User's score history |

### Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | List friends |
| POST | `/api/friends/add` | Add friend by username |
| DELETE | `/api/friends/:userId` | Remove friend |
| GET | `/api/friends/:userId/compare` | Head-to-head stats |
| GET | `/api/friends/search?q=` | Search users |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/leaderboard/rank` | Get your rank |

Query params: `view` (friends/global), `timeframe` (today/week/month/alltime)

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId` | Get user profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/me/stats` | Detailed stats |

## Project Structure

```
bulligan/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── HowToPlayPage.jsx
│   │   │   ├── PredictionPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── LeaderboardPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── schema.sql
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── daily.js
│   │   │   ├── friends.js
│   │   │   ├── leaderboard.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   ├── marketDataService.js    # Yahoo Finance API wrapper
│   │   │   ├── scoringService.js       # Score calculation orchestration
│   │   │   ├── streakService.js        # Streak tracking & mulligan awards
│   │   │   └── tradingCalendarService.js # NYSE holidays & trading days
│   │   ├── scheduler/
│   │   │   └── cronScheduler.js        # Cron job configuration
│   │   ├── scripts/
│   │   │   ├── initDb.js
│   │   │   ├── fetchMorningData.js     # 9:30 AM job
│   │   │   ├── lockPredictions.js      # 11:00 AM job
│   │   │   ├── calculateScores.js      # 4:05 PM job
│   │   │   └── manualScoring.js        # CLI for backfill
│   │   ├── utils/
│   │   │   ├── scoring.js
│   │   │   └── timezone.js             # Eastern Time utilities
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## License

MIT
