# Bulligan v2 Migration Guide

## Overview

This migration implements the simplified game design from the final specification, removing monthly tournaments and implementing the new mulligan system based on 5-day streaks.

## 🎯 Key Changes

### 1. **Mulligan System (New)**
- **Earn mulligans** by playing 5 consecutive trading days
- **Mulligan earned** after market close on day 5
- **Available** starting the next trading day
- **Max 2 mulligans** stored at any time
- **Mulligan window:** 11:00 AM - 2:00 PM ET
- **Usage:** Completely replaces original prediction
- **Tracking:** Scores show 🔄 badge for mulligan predictions

### 2. **Removed Features**
- ❌ Monthly tournaments (`monthly_rounds` table)
- ❌ Weekly tournaments (`weekly_tournaments` table)
- ❌ User round stats (`user_round_stats` table)
- ❌ User tournament stats (`user_tournament_stats` table)
- ❌ Gentleman's 8 penalty (no penalty for missed days)
- ❌ Friend request/accept flow (now instant add)

### 3. **VIX to Par Updates**
- Par 3: VIX < 16 (unchanged)
- Par 4: VIX **16-21** (was 16-20)
- Par 5: VIX **21-25** (was 20-25)
- Par 6: VIX 25+ (unchanged)

### 4. **New Leaderboard System**
- **View Options:** Friends | Global
- **Timeframes:** Today | This Week | This Month | All Time
- **Simplified:** No monthly tournaments, just cumulative scores

### 5. **Streak Tracking (New)**
- Current streak (consecutive trading days played)
- Longest streak (all-time best)
- Last played date
- Streak resets to 0 if you skip a day

## 📊 Database Changes

### New Columns in `users` Table:
```sql
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
last_played_date DATE
mulligans_available INTEGER (0-2)
mulligans_earned_total INTEGER
mulligans_used_total INTEGER
condors, albatrosses, eagles, birdies, pars, bogeys, double_bogeys, triple_bogeys, worse
```

### New Columns in `predictions` Table:
```sql
is_mulligan BOOLEAN DEFAULT false
mulligan_submitted_at TIMESTAMP
```

### Updated `scores` Table:
- Added: `is_mulligan BOOLEAN`
- Removed: `is_gentlemans_eight`, `original_score_id`

### Updated `friendships` Table:
- Removed: `status`, `accepted_at` (instant add, no request flow)

### Removed Tables:
- `monthly_rounds`
- `user_round_stats`
- `weekly_tournaments`
- `user_tournament_stats`

## 🚀 Migration Steps

### Step 1: Backup Your Database
```bash
# Create a backup before migrating
pg_dump bulligan > bulligan_backup_$(date +%Y%m%d).sql
```

### Step 2: Run Migration Script
```bash
cd backend
npm run migrate-v2
```

This script will:
1. ✅ Add new columns to users table
2. ✅ Calculate current streaks for existing users
3. ✅ Award mulligans based on streaks (1 per 5 days)
4. ✅ Update predictions table (add mulligan tracking)
5. ✅ Update scores table (remove gentleman's eight)
6. ✅ Populate score distribution (condors, eagles, etc.)
7. ✅ Simplify friendships table (remove status)
8. ✅ Update VIX to Par function (new ranges)
9. ✅ Drop old tournament tables
10. ✅ Recalculate par values with new VIX ranges

### Step 3: Update Backend Controllers

Replace old controllers with new v2 versions:

```bash
cd backend/src/controllers

# Backup old versions
cp leaderboardController.js leaderboardController_v1_backup.js

# Use new leaderboard controller
cp leaderboardController_v2.js leaderboardController.js
```

### Step 4: Test the Migration

```bash
# Start backend
cd backend
npm run dev

# Test new endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/leaderboard?view=friends&timeframe=week"

curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/leaderboard?view=global&timeframe=month"
```

## 🆕 New API Endpoints

### Mulligan Submission
```
POST /api/predictions/mulligan
Authorization: Bearer <token>
Body: {
  "predictedCloseValue": 5850.00,
  "date": "2026-01-20"
}

Response: {
  "message": "Mulligan used successfully",
  "mulligansRemaining": 1
}
```

### Updated Leaderboard
```
GET /api/leaderboard?view={friends|global}&timeframe={today|week|month|alltime}

Response: {
  "view": "friends",
  "timeframe": "week",
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "...",
      "username": "demo_user",
      "total_score": -12,
      "days_played": 5,
      "avg_score": -2.40,
      "hole_in_ones": 0,
      "eagles": 2,
      "birdies": 3,
      ...
      "mulligans_used": 1
    }
  ],
  "totalPlayers": 12
}
```

### User Rank
```
GET /api/leaderboard/rank?view={friends|global}&timeframe={week}

Response: {
  "rank": 4,
  "total_score": -12,
  "days_played": 5,
  "total_players": 12
}
```

## 🎨 Frontend Updates Needed

### 1. **Prediction Page**
- Add mulligan button (shows if mulligans_available > 0)
- Show mulligan window status (11 AM - 2 PM)
- Display mulligans remaining
- Show current streak

### 2. **Profile Page**
- Add streak stats card (current streak, longest streak)
- Add mulligans section (available, total used)
- Update score distribution (add condors, albatrosses, etc.)
- Show 🔄 badge on scores achieved via mulligan

### 3. **Leaderboard Page**
- Add view toggle: Friends | Global
- Add timeframe toggle: Today | Week | Month | All Time
- Remove monthly/weekly tournament references
- Show mulligans used in leaderboard table

### 4. **Navigation**
- History page already removed ✅

## 📝 Example Frontend Service Updates

### Update `predictionService.js`:
```javascript
// Submit mulligan prediction
submitMulligan: async (predictedCloseValue, date) => {
  const response = await api.post('/predictions/mulligan', {
    predictedCloseValue,
    date
  });
  return response.data;
},
```

### Update `leaderboardService.js`:
```javascript
// Get leaderboard with view and timeframe
getLeaderboard: async (view = 'friends', timeframe = 'week') => {
  const response = await api.get(`/leaderboard?view=${view}&timeframe=${timeframe}`);
  return response.data;
},

getUserRank: async (view = 'friends', timeframe = 'week') => {
  const response = await api.get(`/leaderboard/rank?view=${view}&timeframe=${timeframe}`);
  return response.data;
},
```

### Update `profileService.js`:
```javascript
getProfile: async () => {
  const response = await api.get('/profile');
  return response.data; // Now includes current_streak, mulligans_available, etc.
},
```

## ⚠️ Breaking Changes

1. **Leaderboard API:** Complete rewrite
   - Old: `/api/leaderboard/monthly?year=2026&month=1`
   - New: `/api/leaderboard?view=global&timeframe=month`

2. **No More Tournaments:** Frontend should remove any tournament-related UI

3. **Friendships:** Instant add (no pending/accepted status)

4. **Par Calculation:** Some days may have different par values after migration

## ✅ Post-Migration Checklist

- [ ] Database backup created
- [ ] Migration script run successfully
- [ ] All tests passing
- [ ] Frontend services updated
- [ ] Prediction page shows mulligan UI
- [ ] Profile page shows streaks
- [ ] Leaderboard shows friends/global toggles
- [ ] Par values recalculated correctly
- [ ] User streaks calculated correctly
- [ ] Mulligans awarded based on streaks

## 🔄 Rollback Plan

If you need to rollback:

```bash
# Restore from backup
psql bulligan < bulligan_backup_YYYYMMDD.sql

# Restore old controllers
cd backend/src/controllers
cp leaderboardController_v1_backup.js leaderboardController.js

# Restart backend
npm run dev
```

## 📚 Additional Resources

- **New Schema:** `backend/database/schema_v2.sql`
- **Migration Script:** `backend/scripts/migrateToV2.js`
- **New Controllers:** `backend/src/controllers/*_v2.js`
- **Final Design Doc:** See game design document

## 🎉 Benefits of v2

1. **Simpler:** No complex tournament logic
2. **More Flexible:** Play when you want, no monthly commitment
3. **Strategic Depth:** Mulligan system rewards consistency
4. **Better Social:** Easy friend comparison
5. **Cleaner Code:** Removed unused tables and complexity

---

**Migration created:** 2026-01-20
**Status:** Ready for implementation
**Estimated time:** ~15 minutes including backup
