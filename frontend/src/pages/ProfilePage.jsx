import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
  // Mock user data - replace with API calls later
  const user = {
    username: 'GolfPro42',
    totalScore: -12,
    holesPlayed: 15,
    avgScore: -0.8,
    bestRound: -8,
    holeInOnes: 2,
    rank: 23
  };

  const recentScores = [
    { date: 'Jan 17', par: 4, score: -1, scoreName: 'Birdie', actual: 5847.20, predicted: 5852.10, deviation: 0.08 },
    { date: 'Jan 16', par: 4, score: -2, scoreName: 'Eagle', actual: 5832.45, predicted: 5834.20, deviation: 0.03 },
    { date: 'Jan 15', par: 3, score: 0, scoreName: 'Par', actual: 5819.33, predicted: 5824.50, deviation: 0.09 },
    { date: 'Jan 14', par: 4, score: 1, scoreName: 'Bogey', actual: 5801.23, predicted: 5815.60, deviation: 0.25 },
    { date: 'Jan 13', par: 5, score: -1, scoreName: 'Birdie', actual: 5795.10, predicted: 5800.45, deviation: 0.09 }
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
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">{user.username}</h1>
          <p className="text-lg text-gray-600">Rank #{user.rank}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Score</p>
            <p className="text-3xl font-bold text-green-900">{user.totalScore}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Holes Played</p>
            <p className="text-3xl font-bold text-blue-900">{user.holesPlayed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-orange-900">{user.avgScore.toFixed(1)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Hole in Ones</p>
            <p className="text-3xl font-bold text-purple-900">{user.holeInOnes}</p>
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
                {recentScores.map((score, idx) => (
                  <tr key={idx} className="border-b border-green-50 hover:bg-green-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{score.date}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{score.par}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${getScoreColor(score.score)}`}>
                        {score.score > 0 ? '+' : ''}{score.score} ({score.scoreName})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">${score.actual.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-gray-700">${score.predicted.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{score.deviation.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Score</span>
                <span className="font-bold text-green-900">{user.totalScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Round</span>
                <span className="font-bold text-green-900">{user.bestRound}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Holes Played</span>
                <span className="font-bold text-green-900">{user.holesPlayed}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Eagle Eye</p>
                  <p className="text-sm text-gray-600">3 Eagles in a month</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hole in One</p>
                  <p className="text-sm text-gray-600">Perfect prediction on Par 3</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
