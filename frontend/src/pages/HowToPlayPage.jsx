import { Clock, TrendingUp, Award } from 'lucide-react';

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-900 mb-4">How to Play</h1>
          <p className="text-xl text-gray-600">
            Your guide to mastering Bulligan
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900">Making Predictions</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              Each trading day (Monday-Friday), you have until <strong>11:00 AM ET</strong> to predict where the S&P 500 will close at 4:00 PM ET.
            </p>
            
            <div className="bg-green-50 rounded-lg p-6 space-y-3">
              <p className="font-medium text-green-900">Quick Tips:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>You'll see yesterday's close and today's opening price to help your prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Check the current par level - it tells you expected volatility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>You can edit your prediction until 11 AM when it locks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Miss a day? No penalty - just play when you want!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900">Scoring System</h2>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Your golf score is calculated from your <strong>deviation percentage</strong> from the actual close:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-50">
                  <th className="border border-green-200 px-4 py-3 text-left text-green-900 font-semibold">Deviation</th>
                  <th className="border border-green-200 px-4 py-3 text-left text-green-900 font-semibold">Strokes</th>
                  <th className="border border-green-200 px-4 py-3 text-left text-green-900 font-semibold">Example Score (Par 4)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-green-200 px-4 py-3">≤ 0.1%</td>
                  <td className="border border-green-200 px-4 py-3">1</td>
                  <td className="border border-green-200 px-4 py-3 text-blue-600 font-semibold">-3 (Albatross)</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-green-200 px-4 py-3">0.1% - 0.25%</td>
                  <td className="border border-green-200 px-4 py-3">2</td>
                  <td className="border border-green-200 px-4 py-3 text-blue-600 font-semibold">-2 (Eagle)</td>
                </tr>
                <tr>
                  <td className="border border-green-200 px-4 py-3">0.25% - 0.5%</td>
                  <td className="border border-green-200 px-4 py-3">3</td>
                  <td className="border border-green-200 px-4 py-3 text-green-600 font-semibold">-1 (Birdie)</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-green-200 px-4 py-3">0.5% - 1.0%</td>
                  <td className="border border-green-200 px-4 py-3">4</td>
                  <td className="border border-green-200 px-4 py-3 text-gray-600 font-semibold">0 (Par)</td>
                </tr>
                <tr>
                  <td className="border border-green-200 px-4 py-3">1.0% - 2.0%</td>
                  <td className="border border-green-200 px-4 py-3">5</td>
                  <td className="border border-green-200 px-4 py-3 text-orange-600 font-semibold">+1 (Bogey)</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-green-200 px-4 py-3">2.0% - 3.0%</td>
                  <td className="border border-green-200 px-4 py-3">6</td>
                  <td className="border border-green-200 px-4 py-3 text-orange-600 font-semibold">+2 (Double)</td>
                </tr>
                <tr>
                  <td className="border border-green-200 px-4 py-3">3.0% - 5.0%</td>
                  <td className="border border-green-200 px-4 py-3">7</td>
                  <td className="border border-green-200 px-4 py-3 text-red-600 font-semibold">+3 (Triple)</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-green-200 px-4 py-3">&gt; 5.0%</td>
                  <td className="border border-green-200 px-4 py-3">8</td>
                  <td className="border border-green-200 px-4 py-3 text-red-600 font-semibold">+4 (Quad)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium mb-2">💡 Pro Tip:</p>
            <p className="text-blue-800">
              Lower cumulative scores win! Aim for negative numbers (Eagles and Birdies) and avoid high positive scores (Bogeys and worse).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900">Par Levels</h2>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Par changes daily based on the VIX (market volatility index). Higher volatility means higher par - the course gets harder!
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900 mb-2">Par 3</div>
              <div className="text-sm text-gray-600 mb-2">VIX &lt; 16</div>
              <p className="text-gray-700">Calm markets. A hole-in-one (1 stroke) scores an Albatross!</p>
            </div>

            <div className="border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900 mb-2">Par 4</div>
              <div className="text-sm text-gray-600 mb-2">VIX 16-21</div>
              <p className="text-gray-700">Normal volatility. Most common par level.</p>
            </div>

            <div className="border border-orange-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-900 mb-2">Par 5</div>
              <div className="text-sm text-gray-600 mb-2">VIX 21-25</div>
              <p className="text-gray-700">Elevated volatility. Harder to score well.</p>
            </div>

            <div className="border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-900 mb-2">Par 6</div>
              <div className="text-sm text-gray-600 mb-2">VIX ≥ 25</div>
              <p className="text-gray-700">High volatility. Very challenging conditions!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Mulligans</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">🔄 Earning Mulligans</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Play <strong>5 consecutive trading days</strong> to earn a mulligan. You can store up to <strong>2 mulligans</strong> at a time.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 ml-4">
                <li>• Mulligan is earned after market close on day 5</li>
                <li>• Available to use starting the next trading day</li>
                <li>• Miss a day and your streak resets to 0</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">⏰ Using Mulligans</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Between <strong>11:00 AM - 2:00 PM ET</strong>, you can use a mulligan to submit a new prediction that replaces your original.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 ml-4">
                <li>• Your original prediction locks at 11 AM</li>
                <li>• Click "Use Mulligan" to enter a new prediction</li>
                <li>• Mulligan prediction locks at 2 PM</li>
                <li>• Scored on whichever prediction was active at close</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 font-medium mb-2">💡 Strategic Tip</p>
              <p className="text-green-800">
                Use mulligans when mid-day news significantly changes your market outlook. You've already seen the morning action!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
