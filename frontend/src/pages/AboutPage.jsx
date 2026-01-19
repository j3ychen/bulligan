import { TrendingUp, Trophy, Target, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-900 mb-4">About Bulligan</h1>
          <p className="text-xl text-gray-600">
            Where Market Predictions Meet Golf Scoring
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-gray-700 leading-relaxed mb-6">
            Bulligan is a gamified stock market prediction app that combines the excitement of forecasting with the scoring system of golf. Every trading day presents a new "hole" where you predict the S&P 500's closing price, and your accuracy determines your golf score.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Just as golfers aim for eagles and birdies, Bulligan players strive for precision. The closer your prediction to the actual close, the fewer strokes you take. With daily volatility setting the "par" and unexpected market moves creating "weather events," each day brings new challenges.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Compete monthly against other players, track your improvement over time, and see if you can master the art of market prediction. Welcome to the clubhouse!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Daily Predictions</h3>
            <p className="text-gray-600">
              Forecast the S&P 500 closing price before 11 AM ET each trading day.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Golf Scoring</h3>
            <p className="text-gray-600">
              Earn eagles, birdies, pars, and bogeys based on your accuracy.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Dynamic Par</h3>
            <p className="text-gray-600">
              Par changes daily based on market volatility (VIX).
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Monthly Competition</h3>
            <p className="text-gray-600">
              Compete throughout the month with cumulative scoring.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/how-to-play"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Learn How to Play
          </a>
        </div>

      </div>
    </div>
  );
}
