import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Calendar, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PredictionPage() {
  const { token } = useAuth();
  const [prediction, setPrediction] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mulliganPrediction, setMulliganPrediction] = useState('');
  const [showMulliganForm, setShowMulliganForm] = useState(false);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/daily/today`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch today\'s data');
      }

      const data = await response.json();
      setMarketData(data);

      // Pre-fill prediction input if user has already submitted
      if (data.userPrediction) {
        setPrediction(data.userPrediction.predictedClose.toString());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/daily/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ predictedClose: parseFloat(prediction) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit prediction');
      }

      setSuccess('Prediction saved successfully!');
      // Refresh data to get updated state
      await fetchTodayData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMulliganSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/daily/mulligan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ predictedClose: parseFloat(mulliganPrediction) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to use mulligan');
      }

      setSuccess('Mulligan used successfully! Your prediction has been updated.');
      setShowMulliganForm(false);
      setMulliganPrediction('');
      // Refresh data to get updated state
      await fetchTodayData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading today's market data...</p>
        </div>
      </div>
    );
  }

  // No market data yet (market hasn't opened or non-trading day)
  if (!marketData || !marketData.currentOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-900 mb-2">Today's Prediction</h1>
            <p className="text-lg text-gray-600">{formatDate(marketData?.date || new Date().toISOString().split('T')[0])}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Market Not Open Yet</h3>
            <p className="text-gray-600 mb-4">
              Today's market data will be available after the market opens at 9:30 AM ET.
            </p>
            {marketData?.previousClose && (
              <p className="text-sm text-gray-500">
                Yesterday's close: ${marketData.previousClose.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const canSubmitPrediction = marketData.isPredictionWindowOpen && !marketData.userPrediction?.isLocked;
  const canUseMulligan = marketData.isMulliganWindowOpen &&
                         marketData.mulligansAvailable > 0 &&
                         marketData.userPrediction &&
                         !marketData.userPrediction.usedMulligan;
  const isPredictionLocked = marketData.userPrediction?.isLocked ||
                             (!marketData.isPredictionWindowOpen && marketData.userPrediction);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Today's Prediction</h1>
          <p className="text-lg text-gray-600">{formatDate(marketData.date)}</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Market Data Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Yesterday's Close</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              ${marketData.previousClose?.toFixed(2) || '—'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Today's Open</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">${marketData.currentOpen.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Par</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">{marketData.par}</p>
            <p className="text-xs text-gray-500 mt-1">VIX: {marketData.vix?.toFixed(1)}</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-800 font-medium">Mulligans Available</p>
              <p className="text-xs text-green-600">Current Streak: {marketData.currentStreak} days</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-green-900">{marketData.mulligansAvailable}</span>
        </div>

        {/* Main Prediction Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-900">
              {isPredictionLocked ? 'Your Prediction' : 'Make Your Prediction'}
            </h2>
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {marketData.isPredictionWindowOpen
                  ? `Deadline: ${formatTime(marketData.predictionDeadline)}`
                  : marketData.isMulliganWindowOpen
                    ? `Mulligan until: ${formatTime(marketData.mulliganDeadline)}`
                    : `Results at: ${formatTime(marketData.resultsTime)}`
                }
              </span>
            </div>
          </div>

          {/* Prediction Form (when window is open) */}
          {canSubmitPrediction && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="prediction" className="block text-lg font-medium text-gray-700 mb-2">
                  Where will the S&P 500 close today?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
                  <input
                    id="prediction"
                    type="number"
                    step="0.01"
                    value={prediction}
                    onChange={(e) => setPrediction(e.target.value)}
                    placeholder="5850.00"
                    className="w-full pl-10 pr-4 py-4 text-2xl border-2 border-green-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    required
                    disabled={submitting}
                  />
                </div>
                {prediction && !isNaN(parseFloat(prediction)) && marketData.previousClose && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Implied move vs. prior close:</span>
                      {(() => {
                        const impliedMove = ((parseFloat(prediction) - marketData.previousClose) / marketData.previousClose) * 100;
                        const isPositive = impliedMove >= 0;
                        return (
                          <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{impliedMove.toFixed(2)}%
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        ${marketData.previousClose.toFixed(2)} → ${parseFloat(prediction).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(() => {
                          const diff = parseFloat(prediction) - marketData.previousClose;
                          return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} pts`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}
                {!prediction && (
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your predicted closing price for the S&P 500
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : marketData.userPrediction ? (
                  'Update Prediction'
                ) : (
                  'Submit Prediction'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                You can edit your prediction until {formatTime(marketData.predictionDeadline)}
              </p>
            </form>
          )}

          {/* Locked Prediction Display */}
          {isPredictionLocked && marketData.userPrediction && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Prediction Locked</h3>
              <p className="text-3xl font-bold text-green-900 mb-2">
                ${marketData.userPrediction.predictedClose.toFixed(2)}
              </p>
              {marketData.userPrediction.usedMulligan && (
                <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                  <RefreshCw className="w-4 h-4" />
                  Mulligan used
                </p>
              )}
              <p className="text-gray-600 mt-4">
                {marketData.scoresCalculated
                  ? 'Results are in! Check your profile for your score.'
                  : `Check back at ${formatTime(marketData.resultsTime)} for results!`
                }
              </p>
            </div>
          )}

          {/* No Prediction Yet (after deadline) */}
          {!marketData.isPredictionWindowOpen && !marketData.userPrediction && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deadline Passed</h3>
              <p className="text-gray-600">
                The prediction window has closed. Come back tomorrow to make your prediction before 11:00 AM ET!
              </p>
            </div>
          )}
        </div>

        {/* Mulligan Section */}
        {canUseMulligan && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-900">Use a Mulligan?</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Your current prediction: <strong>${marketData.userPrediction.predictedClose.toFixed(2)}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              You have <strong>{marketData.mulligansAvailable}</strong> mulligan(s) available.
              You can update your prediction until {formatTime(marketData.mulliganDeadline)}.
            </p>

            {!showMulliganForm ? (
              <button
                onClick={() => setShowMulliganForm(true)}
                className="w-full bg-green-100 text-green-800 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors"
              >
                Use Mulligan
              </button>
            ) : (
              <form onSubmit={handleMulliganSubmit} className="space-y-4">
                <div>
                  <label htmlFor="mulliganPrediction" className="block text-sm font-medium text-gray-700 mb-2">
                    New Prediction
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">$</span>
                    <input
                      id="mulliganPrediction"
                      type="number"
                      step="0.01"
                      value={mulliganPrediction}
                      onChange={(e) => setMulliganPrediction(e.target.value)}
                      placeholder="5850.00"
                      className="w-full pl-10 pr-4 py-3 text-xl border-2 border-green-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMulliganForm(false);
                      setMulliganPrediction('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Using...
                      </>
                    ) : (
                      'Confirm Mulligan'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Tips for Today:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Market opened {marketData.currentOpen > (marketData.previousClose || 0) ? 'higher' : 'lower'} than yesterday's close</li>
            <li>• Par {marketData.par} indicates {marketData.par <= 4 ? 'normal' : 'elevated'} expected volatility</li>
            <li>• Consider recent market trends and news when making your prediction</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
