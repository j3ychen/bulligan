import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

export default function PredictionPage() {
  const [currentPrice, setCurrentPrice] = useState(5815.23);
  const previousClose = 5803.98;
  const [prediction, setPrediction] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [timeUntilDeadline, setTimeUntilDeadline] = useState('2h 34m');
  
  const todaysPar = 4;
  const todaysDate = 'January 16, 2026';
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 2;
        return parseFloat((prev + change).toFixed(2));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const calculateImpliedMove = () => {
    if (!prediction || isNaN(prediction)) return null;
    const move = ((parseFloat(prediction) - previousClose) / previousClose) * 100;
    return move;
  };
  
  const impliedMove = calculateImpliedMove();
  
  const handleSubmit = () => {
    if (prediction && !isNaN(prediction)) {
      setIsLocked(true);
    }
  };
  
  const getParInfo = (par) => {
    const parInfo = {
      3: { vix: '< 16', difficulty: 'Low Volatility', color: 'text-yellow-300' },
      4: { vix: '16-20', difficulty: 'Moderate Volatility', color: 'text-yellow-300' },
      5: { vix: '20-25', difficulty: 'High Volatility', color: 'text-yellow-300' },
      6: { vix: '> 25', difficulty: 'Extreme Volatility', color: 'text-yellow-300' },
    };
    return parInfo[par];
  };
  
  const parInfo = getParInfo(todaysPar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">Bulligan</h1>
              <p className="text-green-100">{todaysDate}</p>
            </div>
            <Award className="w-12 h-12 text-yellow-400" />
          </div>
          
          <div className="bg-green-700 bg-opacity-40 rounded-lg p-4 mb-4 border border-yellow-400 border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-100">Today's Par</div>
                <div className={`text-4xl font-bold ${parInfo.color}`}>
                  Par {todaysPar}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-100">VIX Range</div>
                <div className="text-lg font-semibold text-yellow-300">{parInfo.vix}</div>
                <div className="text-xs text-green-200">{parInfo.difficulty}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-yellow-400 bg-opacity-90 border border-yellow-500 rounded-lg p-3">
            <Clock className="w-5 h-5 text-green-900" />
            <span className="text-green-900 font-semibold">
              {isLocked ? 'Prediction Locked' : `Deadline in ${timeUntilDeadline}`}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-700" />
            <h2 className="text-lg font-semibold text-green-900">S&P 500 Current Price</h2>
          </div>
          <div className="text-5xl font-bold text-green-800 mb-1">
            {currentPrice.toFixed(2)}
          </div>
          <div className="text-sm text-green-600 mb-3">Updates every few seconds</div>
          <div className="text-sm text-green-700 pt-3 border-t border-green-100">
            Previous Close: <span className="font-semibold">{previousClose.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-700" />
            <h2 className="text-lg font-semibold text-green-900">Your Prediction</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-green-900 mb-2">
              Predict closing price (4:00 PM ET)
            </label>
            <input
              type="number"
              step="0.01"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              disabled={isLocked}
              placeholder="e.g., 5847.50"
              className="w-full px-4 py-3 text-2xl font-semibold border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 disabled:bg-green-50 disabled:cursor-not-allowed"
            />
          </div>

          {impliedMove !== null && (
            <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">Implied Move from Yesterday's Close</div>
              <div className={`text-3xl font-bold ${impliedMove >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {impliedMove >= 0 ? '+' : ''}{impliedMove.toFixed(2)}%
              </div>
              <div className="text-sm text-green-600 mt-1">
                {impliedMove >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(prediction) - previousClose).toFixed(2)} points from {previousClose.toFixed(2)}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!prediction || isNaN(prediction) || isLocked}
            className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-yellow-50 font-semibold py-3 px-6 rounded-lg transition-all shadow-md"
          >
            {isLocked ? 'Prediction Submitted ✓' : 'Submit Prediction'}
          </button>
          
          {isLocked && (
            <div className="mt-4 text-center text-sm text-green-700">
              Check back at 4:15 PM ET for your score!
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Scoring Guide</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Within 0.1%</span>
              <span className="font-semibold text-green-900">1 stroke</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Within 0.25%</span>
              <span className="font-semibold text-green-900">2 strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Within 0.5%</span>
              <span className="font-semibold text-green-900">3 strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Within 1.0%</span>
              <span className="font-semibold text-green-900">4 strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Within 2.0%</span>
              <span className="font-semibold text-green-900">5 strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Within 3.0%</span>
              <span className="font-semibold text-green-900">6 strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Within 5.0%</span>
              <span className="font-semibold text-green-900">7 strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Over 5.0%</span>
              <span className="font-semibold text-green-900">8 strokes</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="text-xs text-green-700">
              <strong>Par {todaysPar} today:</strong> 4 strokes = Par, 3 strokes = Birdie, 2 strokes = Eagle!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}