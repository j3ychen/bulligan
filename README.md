# 🎯 Bulligan - Golf-Style S&P 500 Prediction Game

A full-stack web application that gamifies daily S&P 500 predictions using golf scoring mechanics.

## 🎮 Game Overview

Bulligan is a daily prediction game where you:
- Predict where the S&P 500 will close each trading day
- Get scored based on accuracy using golf terminology (Birdie, Eagle, Par, etc.)
- Compete with friends or globally across multiple timeframes
- Build streaks to earn strategic mulligans
- Track your performance history

### Golf Scoring System

Your prediction accuracy determines your "strokes":
- **Hole-in-One**: Perfect prediction (≤0.1% deviation)
- **2 Strokes**: Excellent (≤0.25% deviation)
- **3 Strokes**: Great (≤0.5% deviation)
- **4 Strokes**: Good (≤1.0% deviation)
- **5-8 Strokes**: Progressive deviation up to 5%+

The day's **Par** is determined by VIX (market volatility):
- **Par 3**: VIX < 16 (calm markets)
- **Par 4**: VIX 16-21 (normal)
- **Par 5**: VIX 21-25 (elevated volatility)
- **Par 6**: VIX ≥ 25 (high volatility)

Your **Golf Score** = Strokes - Par (lower is better!)

### Mulligan System

**Earn mulligans through consistency:**
- Play **5 consecutive trading days** → earn 1 mulligan
- Mulligan awarded **after market close** on day 5
- Available starting the **next trading day**
- Max **2 mulligans** can be stored at once
- Skip a day → streak resets to 0

**Using a mulligan:**
- **Mulligan window:** 11:00 AM - 2:00 PM ET (after regular deadline)
- Completely **replaces** your original prediction
- Consumes 1 mulligan from your stored count
- Scores show 🔄 badge when achieved via mulligan
- Strategic: Use when you change your mind or new information emerges

## 🏗️ Tech Stack

### Backend
- **Express.js** - REST API server
- **PostgreSQL** - Database with comprehensive schema
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, PostgreSQL 14+

```bash
# 1. Create PostgreSQL database
psql postgres
CREATE DATABASE bulligan;
\q

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run setup              # Initialize DB + Seed sample data

# 3. Setup Frontend
cd ../frontend
npm install

# 4. Start Development Servers
# Terminal 1 - Backend
cd backend
npm run dev                # Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev                # Runs on http://localhost:5173

# 5. Login with demo account
# Username: demo_user
# Password: password123
```

**Full setup guide:** See [SETUP.md](./SETUP.md)

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[INTEGRATION.md](./INTEGRATION.md)** - API documentation and architecture
- **[MIGRATION_V2.md](./MIGRATION_V2.md)** - Migration guide for v2 mulligan system
- **[backend/database/schema_v2.sql](./backend/database/schema_v2.sql)** - Latest database schema (v2)

## ✨ Features

### For Players
- 📊 **Daily Predictions** - Submit predictions before 11:00 AM ET
- 🏆 **Leaderboards** - Compare with friends or globally (today/week/month/all-time)
- 📈 **Performance Tracking** - View your history and statistics
- 🎯 **Mulligan System** - Earn mulligans through 5-day play streaks (max 2 stored)
- 🔥 **Streak Tracking** - Build consecutive play streaks for rewards
- ☁️ **Weather Conditions** - Course difficulty modifiers
- 🏅 **Achievements** - Track your best performances
- 👥 **Friends** - Add friends instantly and compare scores head-to-head

### Technical Features
- 🔐 **JWT Authentication** - Secure user sessions
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Live market data integration ready
- 🎨 **Modern UI** - Tailwind CSS with golf-themed design
- 🗃️ **Comprehensive Database** - Full PostgreSQL schema with indexes
- 🔄 **RESTful API** - Clean, documented endpoints

## 🗄️ Database Schema

**Core Tables:**
- `users` - User profiles with streak tracking and mulligan counts
- `daily_market_data` - S&P 500 + VIX data with par calculations
- `predictions` - User daily predictions with mulligan tracking
- `scores` - Calculated golf scores with deviation tracking

**Tracking Features:**
- **Streaks:** Current streak, longest streak, last played date
- **Mulligans:** Available (0-2), earned total, used total
- **Score Distribution:** Condors, albatrosses, eagles, birdies, pars, bogeys, etc.

**Social Features:**
- `friendships` - User connections (instant add, no request/accept)
- `notifications` - User notifications

## 🛠️ Development Scripts

### Backend
```bash
npm run dev        # Start development server with nodemon
npm run start      # Start production server
npm run init-db    # Initialize database tables
npm run seed       # Populate sample data
npm run setup      # Initialize + Seed (one command)
npm run migrate-v2 # Migrate existing database to v2 (new mulligan system)
npm run reset-db   # Drop all tables (WARNING: deletes data)
```

### Frontend
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📁 Project Structure

```
bulligan/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── server.js        # Express app
│   ├── database/
│   │   └── schema.sql       # PostgreSQL schema
│   ├── scripts/             # DB management scripts
│   └── .env                 # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API service layer
    │   ├── App.jsx          # Main app with routing
    │   └── main.jsx         # Entry point
    └── .env                 # Environment variables
```

## 🔌 API Overview

All endpoints are prefixed with `/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Game Data
- `GET /api/market/today` - Today's market data
- `POST /api/predictions` - Submit prediction (before 11 AM)
- `POST /api/predictions/mulligan` - Submit mulligan prediction (11 AM - 2 PM)
- `GET /api/predictions/today` - Get today's prediction
- `GET /api/profile/stats` - User statistics (includes streaks & mulligans)
- `GET /api/leaderboard?view=friends&timeframe=week` - Leaderboard (friends/global, today/week/month/alltime)
- `GET /api/leaderboard/rank` - User's rank
- `GET /api/history` - Prediction history

See [INTEGRATION.md](./INTEGRATION.md) for complete API documentation.

## 🎯 Sample Data

The seed script generates:
- **30 days** of market data with realistic price movements
- **4 demo users** with varying skill levels
- **50-80 predictions** across all users
- **Complete score history** with golf scores
- **Streak tracking** - Users with varying play streaks
- **Mulligan awards** - Based on 5-day play streaks (max 2 per user)

## 🔐 Security

- JWT-based authentication
- bcrypt password hashing (10 rounds)
- SQL injection protection via parameterized queries
- CORS enabled for frontend
- Environment-based configuration

## 🚧 Roadmap

### Completed ✅
- [x] Mulligan system with 5-day streak rewards
- [x] Friends and global leaderboards
- [x] Multiple timeframe views (today/week/month/all-time)
- [x] Streak tracking
- [x] Instant friend add system

### Near Term
- [ ] Real-time market data integration (Yahoo Finance API)
- [ ] Email notifications for daily reminders and results
- [ ] Frontend UI for mulligan system
- [ ] Mobile app (React Native)
- [ ] Push notifications for prediction deadlines

### Future Enhancements
- [ ] WebSocket support for live updates
- [ ] Advanced analytics and charting
- [ ] Multiple prediction markets (NASDAQ, crypto, etc.)
- [ ] Achievements and badges system
- [ ] Public user profiles
- [ ] Head-to-head friend comparisons

## 🤝 Contributing

This is a demo project. To customize:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

ISC

## 🎮 Game Rules

For complete game rules and scoring details, see the "How to Play" page in the application or check out `frontend/src/pages/HowToPlayPage.jsx`.

---

**Built with ❤️ for financial markets enthusiasts and golf fans**

