import { useState } from 'react';
import { Trophy, Medal, Award, Users, Globe, UserPlus, Search } from 'lucide-react';

export default function LeaderboardPage() {
  const [view, setView] = useState('friends'); // 'friends' or 'global'
  const [timeframe, setTimeframe] = useState('today'); // 'today', 'week', 'month', 'alltime'

  // Mock leaderboard data - replace with API calls later
  const friendsData = {
    today: [
      { rank: 1, username: 'MarketMaster', score: -2, daysPlayed: 1, avgScore: -2.0 },
      { rank: 2, username: 'You', score: -1, daysPlayed: 1, avgScore: -1.0, isCurrentUser: true },
      { rank: 3, username: 'BullRunner', score: 0, daysPlayed: 1, avgScore: 0 },
      { rank: 4, username: 'GolfPro42', score: 1, daysPlayed: 1, avgScore: 1.0 },
    ],
    week: [
      { rank: 1, username: 'MarketMaster', score: -8, daysPlayed: 5, avgScore: -1.6 },
      { rank: 2, username: 'BullRunner', score: -6, daysPlayed: 5, avgScore: -1.2 },
      { rank: 3, username: 'You', score: -5, daysPlayed: 5, avgScore: -1.0, isCurrentUser: true },
      { rank: 4, username: 'GolfPro42', score: -3, daysPlayed: 4, avgScore: -0.75 },
      { rank: 5, username: 'EagleEye', score: -2, daysPlayed: 5, avgScore: -0.4 },
    ],
    month: [
      { rank: 1, username: 'MarketMaster', score: -18, daysPlayed: 15, avgScore: -1.2 },
      { rank: 2, username: 'BullRunner', score: -15, daysPlayed: 15, avgScore: -1.0 },
      { rank: 3, username: 'EagleEye', score: -14, daysPlayed: 15, avgScore: -0.93 },
      { rank: 4, username: 'You', score: -12, daysPlayed: 15, avgScore: -0.8, isCurrentUser: true },
      { rank: 5, username: 'GolfPro42', score: -10, daysPlayed: 14, avgScore: -0.71 },
    ],
    alltime: [
      { rank: 1, username: 'MarketMaster', score: -156, daysPlayed: 120, avgScore: -1.3 },
      { rank: 2, username: 'BullRunner', score: -142, daysPlayed: 118, avgScore: -1.2 },
      { rank: 3, username: 'EagleEye', score: -128, daysPlayed: 115, avgScore: -1.11 },
      { rank: 4, username: 'You', score: -95, daysPlayed: 98, avgScore: -0.97, isCurrentUser: true },
      { rank: 5, username: 'GolfPro42', score: -88, daysPlayed: 102, avgScore: -0.86 },
    ],
  };

  const globalData = {
    today: [
      { rank: 1, username: 'StockWhiz', score: -3, daysPlayed: 1, avgScore: -3.0 },
      { rank: 2, username: 'MarketMaster', score: -2, daysPlayed: 1, avgScore: -2.0 },
      { rank: 3, username: 'TradeKing', score: -2, daysPlayed: 1, avgScore: -2.0 },
      { rank: 47, username: 'You', score: -1, daysPlayed: 1, avgScore: -1.0, isCurrentUser: true },
    ],
    week: [
      { rank: 1, username: 'StockWhiz', score: -12, daysPlayed: 5, avgScore: -2.4 },
      { rank: 2, username: 'ProTrader', score: -10, daysPlayed: 5, avgScore: -2.0 },
      { rank: 3, username: 'MarketMaster', score: -8, daysPlayed: 5, avgScore: -1.6 },
      { rank: 147, username: 'You', score: -5, daysPlayed: 5, avgScore: -1.0, isCurrentUser: true },
    ],
    month: [
      { rank: 1, username: 'StockWhiz', score: -28, daysPlayed: 15, avgScore: -1.87 },
      { rank: 2, username: 'ProTrader', score: -25, daysPlayed: 15, avgScore: -1.67 },
      { rank: 3, username: 'MarketMaster', score: -18, daysPlayed: 15, avgScore: -1.2 },
      { rank: 312, username: 'You', score: -12, daysPlayed: 15, avgScore: -0.8, isCurrentUser: true },
    ],
    alltime: [
      { rank: 1, username: 'StockWhiz', score: -245, daysPlayed: 150, avgScore: -1.63 },
      { rank: 2, username: 'ProTrader', score: -220, daysPlayed: 148, avgScore: -1.49 },
      { rank: 3, username: 'MarketMaster', score: -156, daysPlayed: 120, avgScore: -1.3 },
      { rank: 847, username: 'You', score: -95, daysPlayed: 98, avgScore: -0.97, isCurrentUser: true },
    ],
  };

  const currentData = view === 'friends' ? friendsData : globalData;
  const currentLeaderboard = currentData[timeframe];

  // Find current user for sticky card
  const currentUser = currentLeaderboard.find(p => p.isCurrentUser);
  const totalPlayers = view === 'friends' ? 12 : (timeframe === 'today' ? 2847 : timeframe === 'week' ? 2654 : timeframe === 'month' ? 2432 : 5891);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-green-50 text-green-800 border-green-200';
  };

  const getTimeframeLabel = () => {
    const labels = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      alltime: 'All Time'
    };
    return labels[timeframe];
  };

  const getTimeframeSubtitle = () => {
    const now = new Date();
    if (timeframe === 'today') {
      return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (timeframe === 'week') {
      return 'Mon-Fri, Jan 13-17, 2026';
    }
    if (timeframe === 'month') {
      return 'January 2026';
    }
    return 'Since Launch';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">{getTimeframeSubtitle()}</p>
        </div>

        {/* View Toggle - Friends vs Global */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setView('friends')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'friends'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
            }`}
          >
            <Users className="w-5 h-5" />
            Friends
          </button>
          <button
            onClick={() => setView('global')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'global'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
            }`}
          >
            <Globe className="w-5 h-5" />
            Global
          </button>
        </div>

        {/* Timeframe Toggle */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {['today', 'week', 'month', 'alltime'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                timeframe === tf
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
              }`}
            >
              {tf === 'today' && 'Today'}
              {tf === 'week' && 'This Week'}
              {tf === 'month' && 'This Month'}
              {tf === 'alltime' && 'All Time'}
            </button>
          ))}
        </div>

        {/* Current View Label */}
        <div className="text-center mb-6">
          <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
            {view === 'friends' ? 'Friends' : 'Global'} - {getTimeframeLabel()}
          </span>
        </div>

        {/* Top 3 Podium */}
        {currentLeaderboard.slice(0, 3).filter(p => p.rank <= 3).length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            {currentLeaderboard.find(p => p.rank === 2) && (
              <div className={`bg-white rounded-2xl shadow-xl p-6 text-center transform md:translate-y-4 ${currentLeaderboard.find(p => p.rank === 2)?.isCurrentUser ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-center mb-3">
                  {getRankIcon(2)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-gray-700">
                    {currentLeaderboard.find(p => p.rank === 2)?.username.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {currentLeaderboard.find(p => p.rank === 2)?.username}
                  {currentLeaderboard.find(p => p.rank === 2)?.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                </h3>
                <p className="text-3xl font-bold text-gray-700 mb-2">
                  {currentLeaderboard.find(p => p.rank === 2)?.score}
                </p>
                <p className="text-sm text-gray-600">
                  {currentLeaderboard.find(p => p.rank === 2)?.daysPlayed} {timeframe === 'today' ? 'day' : 'days'}
                </p>
              </div>
            )}

            {/* 1st Place */}
            {currentLeaderboard.find(p => p.rank === 1) && (
              <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-2xl p-6 text-center border-2 border-yellow-300 ${currentLeaderboard.find(p => p.rank === 1)?.isCurrentUser ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-center mb-3">
                  {getRankIcon(1)}
                </div>
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-3 ring-4 ring-yellow-200">
                  <span className="text-3xl font-bold text-yellow-900">
                    {currentLeaderboard.find(p => p.rank === 1)?.username.charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-1">
                  {currentLeaderboard.find(p => p.rank === 1)?.username}
                  {currentLeaderboard.find(p => p.rank === 1)?.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                </h3>
                <p className="text-4xl font-bold text-yellow-800 mb-2">
                  {currentLeaderboard.find(p => p.rank === 1)?.score}
                </p>
                <p className="text-sm text-yellow-700">
                  {currentLeaderboard.find(p => p.rank === 1)?.daysPlayed} {timeframe === 'today' ? 'day' : 'days'}
                </p>
              </div>
            )}

            {/* 3rd Place */}
            {currentLeaderboard.find(p => p.rank === 3) && (
              <div className={`bg-white rounded-2xl shadow-xl p-6 text-center transform md:translate-y-4 ${currentLeaderboard.find(p => p.rank === 3)?.isCurrentUser ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-center mb-3">
                  {getRankIcon(3)}
                </div>
                <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-700">
                    {currentLeaderboard.find(p => p.rank === 3)?.username.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {currentLeaderboard.find(p => p.rank === 3)?.username}
                  {currentLeaderboard.find(p => p.rank === 3)?.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                </h3>
                <p className="text-3xl font-bold text-orange-700 mb-2">
                  {currentLeaderboard.find(p => p.rank === 3)?.score}
                </p>
                <p className="text-sm text-gray-600">
                  {currentLeaderboard.find(p => p.rank === 3)?.daysPlayed} {timeframe === 'today' ? 'day' : 'days'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Your Rank Card (Sticky) */}
        {currentUser && (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-800 font-medium">Your Rank</p>
                <p className="text-2xl font-bold text-green-900">
                  #{currentUser.rank} of {totalPlayers} {view === 'friends' ? 'friends' : 'players'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-medium">{getTimeframeLabel()}</p>
                <p className="text-2xl font-bold text-green-900">
                  {currentUser.score} ({currentUser.daysPlayed} {currentUser.daysPlayed === 1 ? 'day' : 'days'})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b-2 border-green-100">
                <tr>
                  <th className="text-left py-4 px-6 text-green-900 font-bold">Rank</th>
                  <th className="text-left py-4 px-6 text-green-900 font-bold">Player</th>
                  <th className="text-center py-4 px-6 text-green-900 font-bold">Score</th>
                  <th className="text-center py-4 px-6 text-green-900 font-bold">Days</th>
                  <th className="text-center py-4 px-6 text-green-900 font-bold">Avg</th>
                </tr>
              </thead>
              <tbody>
                {currentLeaderboard.map((player, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-green-50 hover:bg-green-50 transition-colors ${
                      player.isCurrentUser ? 'bg-green-100' : player.rank <= 3 ? 'bg-green-25' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold ${getRankBadge(player.rank)}`}>
                          {player.rank}
                        </span>
                        {getRankIcon(player.rank)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${player.isCurrentUser ? 'text-green-700' : 'text-gray-900'}`}>
                        {player.username}
                        {player.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xl font-bold ${player.score < 0 ? 'text-green-700' : player.score > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {player.score > 0 ? '+' : ''}{player.score}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {player.daysPlayed}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {player.avgScore.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Friends Section */}
        {view === 'friends' && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Friends
            </h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                Find Friends
              </button>
            </div>
          </div>
        )}

        {/* How Rankings Work */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">How Rankings Work</h3>
          <p className="text-blue-800">
            Players are ranked by their cumulative golf score for the period. Lower (more negative) scores win!
            Ties are broken by average score per day played.
          </p>
        </div>

      </div>
    </div>
  );
}
