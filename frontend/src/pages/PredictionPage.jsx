import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Calendar } from 'lucide-react';
import { marketService, predictionService } from '../services';

export default function PredictionPage() {
  const [prediction, setPrediction] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [existingPrediction, setExistingPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [market, existingPred] = await Promise.all([
        marketService.getTodayMarketData(),
        predictionService.getTodayPrediction().catch(() => null)
      ]);

      setMarketData(market);
      setExistingPrediction(existingPred);

      if (existingPred?.predicted_close_value) {
        setPrediction(existingPred.predicted_close_value.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const today = new Date().toISOString().split('T')[0];
      await predictionService.submitPrediction(parseFloat(prediction), today);
      setSuccessMessage('Prediction submitted successfully!');

      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to submit prediction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error && !marketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isMarketClosed = marketData?.closing_price !== null;
  const previousClose = marketData?.closing_price || marketData?.opening_price;
  const currentOpen = marketData?.opening_price;
  const currentPar = marketData?.par_value || 4;
  const vix = marketData?.vix_previous_close;
  const isLocked = isMarketClosed || existingPrediction?.is_locked;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Today's Prediction</h1>
          <p className="text-lg text-gray-600">{formatDate(marketData.date)}</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Previous Close</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              ${previousClose ? parseFloat(previousClose).toFixed(2) : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Today's Open</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              ${currentOpen ? parseFloat(currentOpen).toFixed(2) : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Par</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">{currentPar}</p>
            {vix && <p className="text-xs text-gray-500 mt-1">VIX: {parseFloat(vix).toFixed(2)}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-900">Make Your Prediction</h2>
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Deadline: 4:00 PM ET</span>
            </div>
          </div>

          {!isLocked ? (
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
                <p className="text-sm text-gray-500 mt-2">
                  Enter your predicted closing price for the S&P 500
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : existingPrediction ? 'Update Prediction' : 'Submit Prediction'}
              </button>

              <p className="text-center text-sm text-gray-500">
                You can edit your prediction until 4:00 PM ET
              </p>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Prediction Locked</h3>
              <p className="text-gray-600">
                The deadline has passed. Check back at 4:00 PM ET for results!
              </p>
              {existingPrediction && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Your prediction:</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${parseFloat(existingPrediction.predicted_close_value).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Today:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Market opened {currentOpen > previousClose ? 'higher' : 'lower'} than previous close</li>
            <li>• Par {currentPar} indicates {currentPar <= 4 ? 'normal' : 'elevated'} expected volatility</li>
            <li>• Consider recent market trends and news when making your prediction</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
