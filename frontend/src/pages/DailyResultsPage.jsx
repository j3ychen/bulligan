import React, { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Target, Share2, ArrowRight, Sun } from 'lucide-react';

export default function DailyResultsPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const result = {
    date: 'January 16, 2026',
    par: 4,
    weather: 'perfect',
    predicted: 5847.50,
    actual: 5845.10,
    previousClose: 5803.98,
    deviation: 0.04,
    strokes: 2,
    golfScore: -2,
    scoreName: 'Eagle',
    rank: 12,
    totalPlayers: 142,
    percentile: 92,
    monthScore: -5,
    monthRank: 7,
    isMulligan: false
  };

  const todayTop = [
    { username: 'MarketMaster', score: -3, scoreName: 'Albatross', strokes: 1 },
    { username: 'BullRider99', score: -2, scoreName: 'Eagle', strokes: 2 },
    { username: 'You', score: -2, scoreName: 'Eagle', strokes: 2, isYou: true },
    { username: 'VolTrader', score: -1, scoreName: 'Birdie', strokes: 3 },
    { username: 'IndexHunter', score: 0, scoreName: 'Par', strokes: 4 },
  ];

  const getScoreColor = (score) => {
    if (score < 0) return 'text-green-700';
    if (score === 0) return 'text-slate-700';
    return 'text-red-700';
  };

  const getScoreEmoji = (score) => {
    if (score <= -3) return '🏆';
    if (score === -2) return '🦅';
    if (score === -1) return '🐦';
    if (score === 0) return '⛳';
    return '😅';
  };

  const getEncouragementMessage = (score) => {
    if (score <= -3) return "Absolutely incredible! That's legendary.";
    if (score === -2) return "Eagle! Outstanding prediction!";
    if (score === -1) return "Birdie! Well done!";
    if (score === 0) return "Par! Solid prediction.";
    if (score === 1) return "Bogey. Not bad - you'll get 'em tomorrow!";
    return "Tough day, but every pro has them. Tomorrow's a new hole!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      
      <nav className="bg-gradient-to-r from-green-800 to-green-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">Bulligan</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-2xl p-8 mb-8 text-center border-4 border-yellow-400">
          <div className="text-green-100 text-sm mb-2">{result.date}</div>
          <div className="text-8xl mb-4">{getScoreEmoji(result.golfScore)}</div>
          <div className={`text-6xl font-bold mb-2 ${result.golfScore < 0 ? 'text-yellow-400' : 'text-green-100'}`}>
            {result.scoreName}!
          </div>
          <div className="text-2xl text-green-100 mb-4">
            {result.golfScore > 0 ? '+' : ''}{result.golfScore}
          </div>
          <div className="text-green-100 text-lg max-w-md mx-auto">
            {getEncouragementMessage(result.golfScore)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Your Prediction
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">You Predicted</div>
              <div className="text-3xl font-bold text-green-900">{result.predicted.toFixed(2)}</div>
              <div className="text-sm text-green-600 mt-1">
                {((result.predicted - result.previousClose) / result.previousClose * 100) > 0 ? '+' : ''}
                {((result.predicted - result.previousClose) / result.previousClose * 100).toFixed(2)}% from yesterday
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Actual Close</div>
              <div className="text-3xl font-bold text-blue-900">{result.actual.toFixed(2)}</div>
              <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                {((result.actual - result.previousClose) / result.previousClose * 100) > 0 ? (
                  <><TrendingUp className="w-4 h-4" /> +</>
                ) : (
                  <><TrendingDown className="w-4 h-4" /> </>
                )}
                {Math.abs((result.actual - result.previousClose) / result.previousClose * 100).toFixed(2)}% from yesterday
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-green-700 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-green-900">{result.deviation}%</div>
                <div className="text-xs text-green-600">off from actual</div>
              </div>
              <div>
                <div className="text-sm text-green-700 mb-1">Strokes</div>
                <div className="text-2xl font-bold text-green-900">{result.strokes}</div>
                <div className="text-xs text-green-600">based on accuracy</div>
              </div>
              <div>
                <div className="text-sm text-green-700 mb-1">Today's Par</div>
                <div className="text-2xl font-bold text-green-900">{result.par}</div>
                <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                  <Sun className="w-3 h-3" /> {result.weather}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-800 rounded-lg p-4 text-center">
            <div className="text-green-100 text-sm mb-1">Final Score</div>
            <div className="text-4xl font-bold text-yellow-400">
              {result.strokes} - {result.par} = {result.golfScore > 0 ? '+' : ''}{result.golfScore}
            </div>
            <div className="text-green-100 text-lg mt-1">{result.scoreName}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Today's Performance
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Your Rank Today</div>
              <div className="text-4xl font-bold text-green-900">#{result.rank}</div>
              <div className="text-sm text-green-600">of {result.totalPlayers} players</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Percentile</div>
              <div className="text-4xl font-bold text-green-900">{result.percentile}%</div>
              <div className="text-sm text-green-600">better than others</div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Month Total</div>
              <div className={`text-4xl font-bold ${getScoreColor(result.monthScore)}`}>
                {result.monthScore > 0 ? '+' : ''}{result.monthScore}
              </div>
              <div className="text-sm text-green-600">Rank #{result.monthRank}</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-3">Today's Top Performers</h3>
            <div className="space-y-2">
              {todayTop.map((player, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded ${
                    player.isYou ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-900 w-6">#{idx + 1}</span>
                    <span className={`font-semibold ${player.isYou ? 'text-green-900' : 'text-green-800'}`}>
                      {player.username}
                      {player.isYou && (
                        <span className="ml-2 text-xs bg-yellow-400 text-green-900 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-700">{player.strokes} strokes</span>
                    <span className={`font-bold ${getScoreColor(player.score)}`}>
                      {player.scoreName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-gradient-to-r from-green-700 to-green-800 text-yellow-50 px-6 py-4 rounded-lg font-semibold hover:from-green-800 hover:to-green-900 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Result
          </button>
          
          <button className="bg-white border-2 border-green-700 text-green-800 px-6 py-4 rounded-lg font-semibold hover:bg-green-50 transition-all flex items-center justify-center gap-2">
            View Full Leaderboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-yellow-400 mb-2">Tomorrow's Hole Awaits</h3>
          <p className="text-green-100 mb-4">
            Market opens in 16 hours. Come back to make your next prediction!
          </p>
          <button className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
            Set Reminder
          </button>
        </div>

      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-green-900 mb-4">Share Your Result</h3>
            
            <div className="bg-green-50 rounded-lg p-6 mb-4 text-center border-2 border-green-200">
              <div className="text-4xl mb-2">{getScoreEmoji(result.golfScore)}</div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                I scored {result.scoreName} on Bulligan!
              </div>
              <div className={`text-lg font-semibold mb-2 ${getScoreColor(result.golfScore)}`}>
                {result.golfScore > 0 ? '+' : ''}{result.golfScore} on a Par {result.par}
              </div>
              <div className="text-sm text-green-700">
                Ranked #{result.rank} of {result.totalPlayers} players today
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}