import { useState } from 'react';
import { TrendingUp, Clock, Calendar } from 'lucide-react';

export default function PredictionPage() {
  const [prediction, setPrediction] = useState('');

  // Mock data - replace with API calls later
  const mockData = {
    date: 'Friday, January 17, 2026',
    previousClose: 5847.20,
    currentOpen: 5852.10,
    currentPar: 4,
    vix: 18.5,
    deadline: '11:00 AM ET',
    isLocked: false
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Prediction submitted: $${prediction}`);
    // TODO: Send to backend API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Today's Prediction</h1>
          <p className="text-lg text-gray-600">{mockData.date}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Yesterday's Close</p>
            </div>
            <p className="text-2xl font-bold text-green-900">${mockData.previousClose.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Today's Open</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">${mockData.currentOpen.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Par</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">{mockData.currentPar}</p>
            <p className="text-xs text-gray-500 mt-1">VIX: {mockData.vix}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-900">Make Your Prediction</h2>
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Deadline: {mockData.deadline}</span>
            </div>
          </div>

          {!mockData.isLocked ? (
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
                  />
                </div>
                {prediction && !isNaN(parseFloat(prediction)) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Implied move vs. prior close:</span>
                      {(() => {
                        const impliedMove = ((parseFloat(prediction) - mockData.previousClose) / mockData.previousClose) * 100;
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
                        ${mockData.previousClose.toFixed(2)} → ${parseFloat(prediction).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(() => {
                          const diff = parseFloat(prediction) - mockData.previousClose;
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
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
              >
                Submit Prediction
              </button>

              <p className="text-center text-sm text-gray-500">
                You can edit your prediction until {mockData.deadline}
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
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Today:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Market opened {mockData.currentOpen > mockData.previousClose ? 'higher' : 'lower'} than yesterday's close</li>
            <li>• Par {mockData.currentPar} indicates {mockData.currentPar <= 4 ? 'normal' : 'elevated'} expected volatility</li>
            <li>• Consider recent market trends and news when making your prediction</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
