import { Clock, TrendingUp, Award, Zap, Cloud, Wind, CloudRain, Tornado } from 'lucide-react';

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
                  <span>Miss the deadline? You'll receive a "Gentleman's 8" penalty</span>
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
              <div className="text-sm text-gray-600 mb-2">VIX 16-20</div>
              <p className="text-gray-700">Normal volatility. Most common par level.</p>
            </div>

            <div className="border border-orange-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-900 mb-2">Par 5</div>
              <div className="text-sm text-gray-600 mb-2">VIX 20-25</div>
              <p className="text-gray-700">Elevated volatility. Harder to score well.</p>
            </div>

            <div className="border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-900 mb-2">Par 6</div>
              <div className="text-sm text-gray-600 mb-2">VIX ≥ 25</div>
              <p className="text-gray-700">High volatility. Very challenging conditions!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900">Weather Conditions</h2>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Each day's "weather" is determined by how the market actually moved compared to expectations:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <Cloud className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-green-900 mb-1">Perfect Conditions</div>
                <p className="text-gray-700">Market moved as expected by volatility. Standard play.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Wind className="w-8 h-8 text-gray-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Fog</div>
                <p className="text-gray-700">Large intraday swings that reversed. The market changed direction significantly during the day.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
              <CloudRain className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-yellow-900 mb-1">Thunderstorm</div>
                <p className="text-gray-700">Market moved 1.5x more than expected. Significant unexpected volatility.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
              <Tornado className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-red-900 mb-1">Tornado</div>
                <p className="text-gray-700">Market moved 2x+ more than expected. Extreme unexpected movement!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-900 font-medium mb-2">⛳ Weather is Informational</p>
            <p className="text-amber-800">
              Weather conditions don't affect your score - they just help explain what happened that day and why predictions were harder or easier than expected.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Special Rules</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">🔄 Mulligans</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Each month, you get <strong>one mulligan</strong> to replay any hole (trading day). Your original score is automatically converted to a Bogey (+1), giving you a fresh chance to improve.
              </p>
              <p className="text-gray-600 text-sm">
                Use it wisely - save it for those really bad days or weather events!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">⏰ Gentleman's 8</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                If you miss the 11 AM prediction deadline, you'll automatically receive a <strong>Gentleman's 8</strong> - the maximum 8 strokes for that day.
              </p>
              <p className="text-gray-600 text-sm">
                Set reminders to avoid this penalty!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
