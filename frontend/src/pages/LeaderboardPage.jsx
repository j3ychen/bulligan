import { useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('monthly'); // 'monthly' or 'weekly'

  // Mock leaderboard data - replace with API calls later
  const monthlyLeaderboard = [
    { rank: 1, username: 'MarketMaster', score: -18, holesPlayed: 15, avgScore: -1.2 },
    { rank: 2, username: 'BullRunner', score: -15, holesPlayed: 15, avgScore: -1.0 },
    { rank: 3, username: 'EagleEye', score: -14, holesPlayed: 15, avgScore: -0.93 },
    { rank: 4, username: 'GreenJacket', score: -13, holesPlayed: 15, avgScore: -0.87 },
    { rank: 5, username: 'ChipShot', score: -12, holesPlayed: 15, avgScore: -0.8 },
    { rank: 6, username: 'IronPlay', score: -11, holesPlayed: 14, avgScore: -0.79 },
    { rank: 7, username: 'BirdieKing', score: -10, holesPlayed: 15, avgScore: -0.67 },
    { rank: 8, username: 'ProTrader', score: -9, holesPlayed: 15, avgScore: -0.6 },
    { rank: 9, username: 'PuttMaster', score: -8, holesPlayed: 13, avgScore: -0.62 },
    { rank: 10, username: 'TeeTime', score: -7, holesPlayed: 15, avgScore: -0.47 }
  ];

  const weeklyLeaderboard = [
    { rank: 1, username: 'QuickDraw', score: -6, holesPlayed: 5, avgScore: -1.2 },
    { rank: 2, username: 'SpeedGolf', score: -5, holesPlayed: 5, avgScore: -1.0 },
    { rank: 3, username: 'FastTrack', score: -4, holesPlayed: 5, avgScore: -0.8 },
    { rank: 4, username: 'WeekWarrior', score: -4, holesPlayed: 4, avgScore: -1.0 },
    { rank: 5, username: 'DailyGrind', score: -3, holesPlayed: 5, avgScore: -0.6 }
  ];

  const currentLeaderboard = timeframe === 'monthly' ? monthlyLeaderboard : weeklyLeaderboard;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">
            {timeframe === 'monthly' ? 'January 2026' : 'Week of Jan 13-17, 2026'}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              timeframe === 'monthly'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              timeframe === 'weekly'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50'
            }`}
          >
            Weekly
          </button>
        </div>

        {currentLeaderboard.slice(0, 3).length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {currentLeaderboard[1] && (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform md:translate-y-4">
                <div className="flex justify-center mb-3">
                  {getRankIcon(2)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-gray-700">
                    {currentLeaderboard[1].username.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {currentLeaderboard[1].username}
                </h3>
                <p className="text-3xl font-bold text-gray-700 mb-2">
                  {currentLeaderboard[1].score}
                </p>
                <p className="text-sm text-gray-600">
                  {currentLeaderboard[1].holesPlayed} holes
                </p>
              </div>
            )}

            {currentLeaderboard[0] && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-2xl p-6 text-center border-2 border-yellow-300">
                <div className="flex justify-center mb-3">
                  {getRankIcon(1)}
                </div>
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-3 ring-4 ring-yellow-200">
                  <span className="text-3xl font-bold text-yellow-900">
                    {currentLeaderboard[0].username.charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-1">
                  {currentLeaderboard[0].username}
                </h3>
                <p className="text-4xl font-bold text-yellow-800 mb-2">
                  {currentLeaderboard[0].score}
                </p>
                <p className="text-sm text-yellow-700">
                  {currentLeaderboard[0].holesPlayed} holes
                </p>
              </div>
            )}

            {currentLeaderboard[2] && (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform md:translate-y-4">
                <div className="flex justify-center mb-3">
                  {getRankIcon(3)}
                </div>
                <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-700">
                    {currentLeaderboard[2].username.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {currentLeaderboard[2].username}
                </h3>
                <p className="text-3xl font-bold text-orange-700 mb-2">
                  {currentLeaderboard[2].score}
                </p>
                <p className="text-sm text-gray-600">
                  {currentLeaderboard[2].holesPlayed} holes
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b-2 border-green-100">
                <tr>
                  <th className="text-left py-4 px-6 text-green-900 font-bold">Rank</th>
                  <th className="text-left py-4 px-6 text-green-900 font-bold">Player</th>
                  <th className="text-center py-4 px-6 text-green-900 font-bold">Score</th>
                  <th className="text-center py-4 px-6 text-green-900 font-bold">Holes</th>
                  <th className="text-center py-4 px-6 text-green-900 font-bold">Avg</th>
                </tr>
              </thead>
              <tbody>
                {currentLeaderboard.map((player, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-green-50 hover:bg-green-50 transition-colors ${
                      player.rank <= 3 ? 'bg-green-25' : ''
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
                      <span className="font-semibold text-gray-900">{player.username}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-xl font-bold text-green-900">{player.score}</span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {player.holesPlayed}
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

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">🏆 How Rankings Work</h3>
          <p className="text-blue-800">
            Players are ranked by their cumulative golf score for the period. Lower (more negative) scores win! 
            Ties are broken by average score per hole played.
          </p>
        </div>

      </div>
    </div>
  );
}
