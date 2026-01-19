import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { leaderboardService } from '../services';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('monthly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = timeframe === 'monthly'
        ? await leaderboardService.getMonthlyLeaderboard()
        : await leaderboardService.getWeeklyLeaderboard();

      setLeaderboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

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
    if (!leaderboardData) return '';
    if (timeframe === 'monthly') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const month = leaderboardData.month || new Date().getMonth() + 1;
      const year = leaderboardData.year || new Date().getFullYear();
      return `${monthNames[month - 1]} ${year}`;
    } else {
      const week = leaderboardData.week || 1;
      const year = leaderboardData.year || new Date().getFullYear();
      return `Week ${week}, ${year}`;
    }
  };

  const currentLeaderboard = leaderboardData?.leaderboard || [];
  const topThree = currentLeaderboard.slice(0, 3);
  const remaining = currentLeaderboard.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">{getTimeframeLabel()}</p>
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {topThree.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {topThree.map((player, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={player.user_id || idx}
                  className={`bg-white rounded-2xl shadow-xl p-6 text-center border-2 ${getRankBadge(rank)}`}
                >
                  <div className="flex justify-center mb-3">
                    {getRankIcon(rank)}
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">#{rank}</p>
                  <p className="text-xl font-bold text-gray-900 mb-2">{player.username}</p>
                  <p className="text-3xl font-bold text-green-900 mb-1">{player.total_score || 0}</p>
                  <p className="text-sm text-gray-600">
                    {player.holes_played || 0} holes • Avg: {player.avg_score ? parseFloat(player.avg_score).toFixed(2) : '0.00'}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">Rank</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">Player</th>
                  <th className="text-center py-4 px-6 text-gray-700 font-semibold">Score</th>
                  <th className="text-center py-4 px-6 text-gray-700 font-semibold">Holes</th>
                  <th className="text-center py-4 px-6 text-gray-700 font-semibold">Avg</th>
                </tr>
              </thead>
              <tbody>
                {remaining.length > 0 ? (
                  remaining.map((player, idx) => {
                    const rank = idx + 4;
                    return (
                      <tr key={player.user_id || idx} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold">
                            {rank}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">{player.username}</td>
                        <td className="py-4 px-6 text-center font-bold text-green-900">{player.total_score || 0}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{player.holes_played || 0}</td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          {player.avg_score ? parseFloat(player.avg_score).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    );
                  })
                ) : topThree.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500">
                      No players on the leaderboard yet. Be the first to play!
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            {timeframe === 'monthly' ? 'Monthly' : 'Weekly'} leaderboard updates after each trading day closes.
          </p>
        </div>

      </div>
    </div>
  );
}
