import { Trophy, TrendingUp, Calendar, Award, Flame, RefreshCw, Users, Globe } from 'lucide-react';

export default function ProfilePage() {
  // Mock user data - replace with API calls later
  const user = {
    username: 'GolfPro42',
    joinDate: 'October 2025',
    totalDaysPlayed: 47,
    totalScore: -38,
    avgScore: -0.81,
    bestScore: -3,
    bestScoreName: 'Albatross',
    currentStreak: 4,
    longestStreak: 12,
    mulligansAvailable: 1,
    mulligansMax: 2,
    mulligansUsedTotal: 23,
    holeInOnes: 3,
    eagles: 8,
    birdies: 15,
    pars: 12,
    bogeys: 6,
    doubleBogeys: 2,
    tripleBogeys: 1,
    friendsRank: 2,
    friendsTotal: 12,
    globalRank: 147,
  };

  const recentScores = [
    { date: 'Jan 17', par: 4, score: -1, scoreName: 'Birdie', actual: 5847.20, predicted: 5845.10, deviation: 0.04, isMulligan: true },
    { date: 'Jan 16', par: 4, score: 0, scoreName: 'Par', actual: 5832.45, predicted: 5832.50, deviation: 0.00, isMulligan: false },
    { date: 'Jan 15', par: 3, score: -2, scoreName: 'Eagle', actual: 5819.33, predicted: 5819.30, deviation: 0.00, isMulligan: false },
    { date: 'Jan 14', par: 4, score: 1, scoreName: 'Bogey', actual: 5801.23, predicted: 5815.60, deviation: 0.25, isMulligan: false },
    { date: 'Jan 13', par: 5, score: -1, scoreName: 'Birdie', actual: 5795.10, predicted: 5800.45, deviation: 0.09, isMulligan: false },
    { date: 'Jan 10', par: 4, score: 0, scoreName: 'Par', actual: 5780.00, predicted: 5778.50, deviation: 0.03, isMulligan: false },
    { date: 'Jan 9', par: 4, score: -1, scoreName: 'Birdie', actual: 5772.30, predicted: 5770.00, deviation: 0.04, isMulligan: true },
    { date: 'Jan 8', par: 3, score: -2, scoreName: 'Eagle', actual: 5765.20, predicted: 5765.25, deviation: 0.00, isMulligan: false },
  ];

  const getScoreColor = (score) => {
    if (score <= -2) return 'text-blue-600';
    if (score === -1) return 'text-green-600';
    if (score === 0) return 'text-gray-600';
    if (score === 1) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* User Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">{user.username}</h1>
          <p className="text-gray-600">Member since {user.joinDate}</p>
          <button className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm">
            Edit Profile
          </button>
        </div>

        {/* Stats Cards Row 1 */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Days Played</p>
            <p className="text-3xl font-bold text-blue-900">{user.totalDaysPlayed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-green-900">{user.avgScore.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-orange-900">{user.currentStreak} days</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Best Score</p>
            <p className="text-3xl font-bold text-purple-900">{user.bestScore}</p>
            <p className="text-xs text-gray-500">({user.bestScoreName})</p>
          </div>
        </div>

        {/* Stats Cards Row 2 */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Mulligans</p>
            <p className="text-3xl font-bold text-green-900">{user.mulligansAvailable}/{user.mulligansMax}</p>
            <p className="text-xs text-gray-500">Used: {user.mulligansUsedTotal} total</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Hole in Ones</p>
            <p className="text-3xl font-bold text-yellow-900">{user.holeInOnes}</p>
            <p className="text-xs text-gray-500">(on Par 3 days)</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Eagles</p>
            <p className="text-3xl font-bold text-blue-900">{user.eagles}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center gap-2 mb-2">
              <Users className="w-6 h-6 text-green-600" />
              <Globe className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Rank</p>
            <div className="flex justify-center gap-4">
              <div>
                <p className="text-xl font-bold text-green-900">#{user.friendsRank}</p>
                <p className="text-xs text-gray-500">of {user.friendsTotal} friends</p>
              </div>
              <div className="border-l border-gray-200 pl-4">
                <p className="text-xl font-bold text-gray-700">#{user.globalRank}</p>
                <p className="text-xs text-gray-500">global</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Performance Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Performance</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-green-100">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Par</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-semibold">Score</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Predicted</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actual</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Deviation</th>
                </tr>
              </thead>
              <tbody>
                {recentScores.map((score, idx) => (
                  <tr key={idx} className="border-b border-green-50 hover:bg-green-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {score.date}
                      {score.isMulligan && (
                        <span className="ml-2 text-green-600" title="Mulligan used">
                          <RefreshCw className="w-4 h-4 inline" />
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{score.par}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${getScoreColor(score.score)}`}>
                        {score.score > 0 ? '+' : ''}{score.score} ({score.scoreName})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">${score.predicted.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-gray-900">${score.actual.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{score.deviation.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score Distribution & Achievements */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Score Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Hole in Ones</span>
                <span className="font-bold text-gray-900">{user.holeInOnes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Eagles (-2)</span>
                <span className="font-bold text-gray-900">{user.eagles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Birdies (-1)</span>
                <span className="font-bold text-gray-900">{user.birdies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Pars (0)</span>
                <span className="font-bold text-gray-900">{user.pars}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-medium">Bogeys (+1)</span>
                <span className="font-bold text-gray-900">{user.bogeys}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-medium">Double Bogeys (+2)</span>
                <span className="font-bold text-gray-900">{user.doubleBogeys}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-700 font-medium">Triple+ Bogeys</span>
                <span className="font-bold text-gray-900">{user.tripleBogeys}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Achievements</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ace</p>
                  <p className="text-sm text-gray-600">Hit a hole in one</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">🦅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Eagle Eye</p>
                  <p className="text-sm text-gray-600">5 Eagles in a month</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">On Fire</p>
                  <p className="text-sm text-gray-600">10-day streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Consistent</p>
                  <p className="text-sm text-gray-600">Play 20 days in a month (16/20)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-900">Your Friends ({user.friendsTotal})</h3>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              View All Friends
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">MarketMaster</p>
                <p className="text-sm text-gray-600">Avg: -1.20</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">BullRunner</p>
                <p className="text-sm text-gray-600">Avg: -1.00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">EagleEye</p>
                <p className="text-sm text-gray-600">Avg: -0.93</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
