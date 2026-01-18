import React, { useState } from 'react';
import { Cloud, CloudRain, Wind, Sun, Award, Calendar, AlertCircle, XCircle } from 'lucide-react';

export default function HistoryPage() {
  const [showMulliganModal, setShowMulliganModal] = useState(false);
  const [mulligansRemaining, setMulligansRemaining] = useState(1);
  
  const currentTime = '2:45 PM ET';
  const currentSP = 5920.15;
  const todaysPrediction = 5850.00;
  const todaysPar = 4;
  const canUseMulliganToday = true;
  
  const recentHistory = [
    { date: 'Jan 16', par: 4, weather: 'perfect', score: -1, scoreName: 'Birdie', predicted: 5847.20, actual: 5845.10, deviation: 0.04, isMulligan: false, isGentlemans: false },
    { date: 'Jan 15', par: 3, weather: 'tornado', score: 1, scoreName: 'Bogey', predicted: 5810.00, actual: 5867.50, deviation: 0.99, isMulligan: true, isGentlemans: false },
    { date: 'Jan 14', par: 4, weather: 'perfect', score: 0, scoreName: 'Par', predicted: 5803.50, actual: 5805.20, deviation: 0.03, isMulligan: false, isGentlemans: false },
    { date: 'Jan 13', par: 5, weather: 'thunderstorm', score: 2, scoreName: 'Double Bogey', predicted: null, actual: 5792.30, deviation: null, isMulligan: false, isGentlemans: true },
    { date: 'Jan 12', par: 4, weather: 'fog', score: 1, scoreName: 'Bogey', predicted: 5765.00, actual: 5751.80, deviation: 0.23, isMulligan: false, isGentlemans: false },
  ];

  const weatherSummary = {
    perfectDays: 16,
    weatherDays: 4,
    perfectAvg: -0.67,
    weatherAvg: 0.38,
  };

  const getWeatherIcon = (weather) => {
    switch(weather) {
      case 'tornado': return <Wind className="w-4 h-4 text-purple-600" />;
      case 'thunderstorm': return <CloudRain className="w-4 h-4 text-blue-600" />;
      case 'fog': return <Cloud className="w-4 h-4 text-gray-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getScoreColor = (score) => {
    if (score < 0) return 'text-green-700 font-bold';
    if (score === 0) return 'text-slate-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  const projectedStrokes = 5;
  const projectedScore = projectedStrokes - todaysPar;
  const bogeyStrokes = todaysPar + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Your Performance</h1>
          <p className="text-green-100">January 2026 Round</p>
        </div>

        {canUseMulliganToday && mulligansRemaining > 0 && projectedScore > 1 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 mb-2">Mulligan Available - Consider Using It</h3>
                <div className="text-sm text-orange-800 mb-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div><strong>Current time:</strong> {currentTime}</div>
                    <div><strong>Today's Par:</strong> {todaysPar}</div>
                    <div><strong>Your prediction:</strong> {todaysPrediction.toFixed(2)}</div>
                    <div><strong>S&P 500 now:</strong> {currentSP.toFixed(2)}</div>
                  </div>
                  <div className="bg-orange-100 rounded p-2 mb-2">
                    <strong>Projected if closes here:</strong> {projectedStrokes} strokes = {projectedScore > 0 ? '+' : ''}{projectedScore}
                  </div>
                  <div className="bg-green-100 rounded p-2">
                    <strong>With mulligan:</strong> {bogeyStrokes} strokes = Bogey (+1)
                  </div>
                </div>
                <button
                  onClick={() => setShowMulliganModal(true)}
                  className="bg-yellow-400 text-green-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Use Mulligan (Free Drop to Bogey)
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-200">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-3xl font-bold text-green-900 mb-1">+2</div>
              <div className="text-sm text-green-700">Total Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-900 mb-1">15</div>
              <div className="text-sm text-green-700">Holes Played</div>
            </div>
          </div>

          <div className="pt-4 border-t border-green-200">
            <div className="text-sm text-green-700 mb-3">
              <strong>Course Conditions:</strong> {weatherSummary.perfectDays} normal days, {weatherSummary.weatherDays} unusual volatility
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-green-700">Normal days:</span>
                <span className={`ml-2 font-semibold ${getScoreColor(weatherSummary.perfectAvg)}`}>
                  {weatherSummary.perfectAvg > 0 ? '+' : ''}{weatherSummary.perfectAvg} avg
                </span>
              </div>
              <div>
                <span className="text-green-700">Unusual volatility:</span>
                <span className={`ml-2 font-semibold ${getScoreColor(weatherSummary.weatherAvg)}`}>
                  {weatherSummary.weatherAvg > 0 ? '+' : ''}{weatherSummary.weatherAvg} avg
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-200 mb-6">
          <div className="bg-green-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-yellow-100">Recent Performance</h2>
            </div>
          </div>

          <div className="divide-y divide-green-100">
            {recentHistory.map((day, idx) => (
              <div key={idx} className="p-4 hover:bg-green-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {day.isGentlemans ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        getWeatherIcon(day.weather)
                      )}
                      <span className="font-medium text-green-900">{day.date}</span>
                      <span className="text-sm text-green-600">Par {day.par}</span>
                    </div>
                    <div className={`text-lg ${getScoreColor(day.score)}`}>
                      {day.scoreName}
                      {day.isMulligan && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          M
                        </span>
                      )}
                      {day.isGentlemans && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          No Prediction
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!day.isGentlemans && (
                  <div className="text-sm text-green-600 pl-8 mt-1">
                    Predicted: {day.predicted.toFixed(2)} | Actual: {day.actual.toFixed(2)} | Off by: {day.deviation}%
                  </div>
                )}
                {day.isGentlemans && (
                  <div className="text-sm text-red-600 pl-8 mt-1">
                    Missed prediction deadline - automatic 8 strokes
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-green-900">Mulligans</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{mulligansRemaining}/1</div>
          </div>
          <div className="text-sm text-green-600">
            <strong>Free Drop to Bogey.</strong> Use between 11 AM - 4 PM ET on any day. Guarantees Bogey (+1) instead of your actual score. Resets monthly.
          </div>
        </div>

        {showMulliganModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-8 h-8 text-yellow-500" />
                <h3 className="text-xl font-bold text-green-900">Use Your Mulligan?</h3>
              </div>
              
              <p className="text-green-800 mb-4">
                This will automatically convert today's score to <strong>Bogey (+1)</strong>, regardless of how you finish.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMulligansRemaining(0);
                    setShowMulliganModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-700 to-green-800 text-yellow-50 font-semibold py-3 px-6 rounded-lg hover:from-green-800 hover:to-green-900 transition-all"
                >
                  Use Mulligan
                </button>
                <button
                  onClick={() => setShowMulliganModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}