import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';
import { profileService, leaderboardService } from '../services';

export default function ProfilePage() {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [stats, rank] = await Promise.all([
        profileService.getUserStats(),
        leaderboardService.getUserMonthlyRank().catch(() => ({ rank: null }))
      ]);

      setUserStats({ ...stats, rank: rank.rank });
    } catch (err) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score <= -2) return 'text-blue-600';
    if (score === -1) return 'text-green-600';
    if (score === 0) return 'text-gray-600';
    if (score === 1) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const user = userStats?.user || {};
  const currentMonth = userStats?.currentMonth || {};
  const recentScores = userStats?.recentScores || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">{user.username || 'User'}</h1>
          {userStats?.rank && <p className="text-lg text-gray-600">Rank #{userStats.rank}</p>}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Score</p>
            <p className="text-3xl font-bold text-green-900">{user.total_score || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Holes Played</p>
            <p className="text-3xl font-bold text-blue-900">{user.total_holes_played || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-orange-900">
              {user.career_avg_score ? parseFloat(user.career_avg_score).toFixed(1) : '0.0'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Hole in Ones</p>
            <p className="text-3xl font-bold text-purple-900">{user.hole_in_ones || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Performance</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-green-100">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Par</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Score</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actual</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Predicted</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Deviation</th>
                </tr>
              </thead>
              <tbody>
                {recentScores.length > 0 ? (
                  recentScores.map((score, idx) => (
                    <tr key={idx} className="border-b border-green-50 hover:bg-green-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900">{formatDate(score.date)}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{score.par}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold ${getScoreColor(score.golf_score)}`}>
                          {score.golf_score > 0 ? '+' : ''}{score.golf_score} ({score.score_name})
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900">
                        ${score.closing_price ? parseFloat(score.closing_price).toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        ${score.predicted_close_value ? parseFloat(score.predicted_close_value).toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        {score.deviation_pct ? (parseFloat(score.deviation_pct) * 100).toFixed(2) : '0.00'}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No scores yet. Make your first prediction!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">This Month</h3>
            {currentMonth ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Score</span>
                  <span className="font-bold text-green-900">{currentMonth.total_score || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Hole Score</span>
                  <span className="font-bold text-green-900">{currentMonth.best_hole_score || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Holes Played</span>
                  <span className="font-bold text-green-900">{currentMonth.holes_played || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mulligans Left</span>
                  <span className="font-bold text-green-900">{currentMonth.mulligans_remaining || 1}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No data for this month yet.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Score Distribution</h3>
            {currentMonth ? (
              <div className="space-y-2 text-sm">
                {currentMonth.hole_in_ones > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hole in Ones</span>
                    <span className="font-bold text-purple-600">{currentMonth.hole_in_ones}</span>
                  </div>
                )}
                {currentMonth.eagles > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eagles</span>
                    <span className="font-bold text-blue-600">{currentMonth.eagles}</span>
                  </div>
                )}
                {currentMonth.birdies > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Birdies</span>
                    <span className="font-bold text-green-600">{currentMonth.birdies}</span>
                  </div>
                )}
                {currentMonth.pars > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pars</span>
                    <span className="font-bold text-gray-600">{currentMonth.pars}</span>
                  </div>
                )}
                {currentMonth.bogeys > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bogeys</span>
                    <span className="font-bold text-orange-600">{currentMonth.bogeys}</span>
                  </div>
                )}
                {currentMonth.double_bogeys > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Double Bogeys</span>
                    <span className="font-bold text-red-600">{currentMonth.double_bogeys}</span>
                  </div>
                )}
                {!currentMonth.hole_in_ones && !currentMonth.eagles && !currentMonth.birdies &&
                 !currentMonth.pars && !currentMonth.bogeys && !currentMonth.double_bogeys && (
                  <p className="text-gray-500">No scores recorded yet.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No data for this month yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
