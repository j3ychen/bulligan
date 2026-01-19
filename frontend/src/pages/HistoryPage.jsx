import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award } from 'lucide-react';
import { historyService } from '../services';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [mulliganStatus, setMulliganStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [historyData, mulligans] = await Promise.all([
        historyService.getUserHistory(30, 0),
        historyService.getMulliganStatus().catch(() => ({ mulligans_remaining: 1, mulligans_used: 0 }))
      ]);

      setHistory(historyData.history || []);
      setMulliganStatus(mulligans);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score <= -2) return 'text-blue-600 bg-blue-50';
    if (score === -1) return 'text-green-600 bg-green-50';
    if (score === 0) return 'text-gray-600 bg-gray-50';
    if (score === 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    if (history.length === 0) return { totalGames: 0, avgScore: 0, bestScore: 0, holeInOnes: 0 };

    const totalScore = history.reduce((sum, h) => sum + (h.golf_score || 0), 0);
    const avgScore = totalScore / history.length;
    const bestScore = Math.min(...history.map(h => h.golf_score || 0));
    const holeInOnes = history.filter(h => h.is_hole_in_one).length;

    return {
      totalGames: history.length,
      avgScore: avgScore.toFixed(2),
      bestScore,
      holeInOnes
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Prediction History</h1>
          <p className="text-lg text-gray-600">Your past performance and statistics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Games</p>
            <p className="text-3xl font-bold text-green-900">{stats.totalGames}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-blue-900">{stats.avgScore}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Best Score</p>
            <p className="text-3xl font-bold text-purple-900">{stats.bestScore}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Mulligans Left</p>
            <p className="text-3xl font-bold text-orange-900">
              {mulliganStatus?.mulligans_remaining || 1}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Predictions</h2>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-green-100 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{formatDate(item.date)}</span>
                        {item.is_hole_in_one && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded">
                            HOLE IN ONE!
                          </span>
                        )}
                        {item.is_mulligan && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                            MULLIGAN
                          </span>
                        )}
                        {item.is_gentlemans_eight && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                            GENTLEMAN'S 8
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Actual Close</p>
                          <p className="font-bold text-gray-900">
                            ${item.closing_price ? parseFloat(item.closing_price).toFixed(2) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Your Prediction</p>
                          <p className="font-bold text-gray-900">
                            ${item.predicted_close_value ? parseFloat(item.predicted_close_value).toFixed(2) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deviation</p>
                          <p className="font-bold text-gray-900">
                            {item.deviation_pct ? (Math.abs(parseFloat(item.deviation_pct)) * 100).toFixed(2) : '0.00'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Par</p>
                          <p className="font-bold text-gray-900">{item.par}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className={`px-6 py-3 rounded-lg text-center ${getScoreColor(item.golf_score)}`}>
                        <p className="text-2xl font-bold">
                          {item.golf_score > 0 ? '+' : ''}{item.golf_score}
                        </p>
                        <p className="text-sm font-medium">{item.score_name}</p>
                      </div>
                    </div>
                  </div>

                  {item.weather_condition && (
                    <div className="mt-3 pt-3 border-t border-green-100">
                      <p className="text-xs text-gray-600">
                        Weather: <span className="font-medium">{item.weather_condition}</span> •
                        Strokes: {item.strokes} •
                        Par: {item.par}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No prediction history yet</p>
              <p className="text-sm">Make your first prediction to start building your history!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
