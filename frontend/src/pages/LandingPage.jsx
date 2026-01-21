import { Link } from 'react-router-dom';
import { TrendingUp, Users, Trophy, Target, Calendar, Zap, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">

      <nav className="bg-gradient-to-r from-green-800 to-green-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">Bulligan</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/how-to-play" className="text-green-100 hover:text-yellow-400 transition-colors font-semibold">
              How It Works
            </Link>
            <Link to="/login" className="text-green-100 hover:text-yellow-400 transition-colors font-semibold">
              Sign In
            </Link>
            <Link to="/signup" className="bg-yellow-400 text-green-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-green-900 mb-6">
            Predict the Market.<br />
            <span className="text-green-700">Play Like Golf.</span>
          </h1>
          <p className="text-xl text-green-800 mb-8 max-w-2xl mx-auto">
            Daily stock market prediction game with golf scoring. Compete with friends, 
            track your accuracy, and see who can master the S&P 500.
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-green-700 to-green-800 text-yellow-50 px-8 py-4 rounded-lg font-semibold hover:from-green-800 hover:to-green-900 transition-all shadow-md flex items-center gap-2 text-lg"
            >
              Start Playing Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white text-green-800 px-8 py-4 rounded-lg font-semibold border-2 border-green-300 hover:bg-green-50 transition-all flex items-center gap-2 text-lg"
            >
              Sign In
            </Link>
          </div>
          
          <p className="text-sm text-green-600">Free to play • No credit card required • 1 minute setup</p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl border-4 border-green-200 p-6 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between text-yellow-100 mb-4">
              <div>
                <div className="text-sm opacity-80">Today's Par</div>
                <div className="text-4xl font-bold text-yellow-400">Par 4</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">Deadline</div>
                <div className="text-lg font-semibold">11:00 AM ET</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-green-900 font-medium">S&P 500 Current Price</span>
              <span className="text-2xl font-bold text-green-800">5,815.23</span>
            </div>
            <div className="p-3 bg-yellow-50 rounded border-2 border-yellow-300">
              <div className="text-sm text-green-700 mb-2">Your Prediction</div>
              <input
                type="number"
                placeholder="e.g., 5847.50"
                className="w-full px-4 py-2 text-xl font-semibold border-2 border-green-300 rounded-lg"
                disabled
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-y-4 border-green-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-green-900 text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">1. Make Your Prediction</h3>
              <p className="text-green-700">
                Every trading day by 11 AM ET, predict where the S&P 500 will close at 4 PM. 
                The closer you are, the better your score.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">2. Get Your Score</h3>
              <p className="text-green-700">
                At 4:15 PM, receive your golf-style score. Eagle, Birdie, Par, Bogey—just like 
                real golf, but based on prediction accuracy.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">3. Compete & Climb</h3>
              <p className="text-green-700">
                Track your monthly round, compete with friends, and climb the leaderboard. 
                Lower scores win—just like golf.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-green-900 text-center mb-12">
          Why Players Love Bulligan
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <Calendar className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Daily Engagement</h3>
                <p className="text-green-700">
                  Just 2 minutes per day. Make your prediction, check your score, and stay 
                  connected to the market without the stress.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <Zap className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Golf-Style Scoring</h3>
                <p className="text-green-700">
                  Eagles, birdies, pars, and bogeys. Familiar golf terms make complex market 
                  predictions fun and accessible for everyone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <Users className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Play With Friends</h3>
                <p className="text-green-700">
                  Invite friends, create private leaderboards, and see who's the best predictor. 
                  Friendly competition makes it more fun.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Learn the Market</h3>
                <p className="text-green-700">
                  Improve your market intuition through daily practice. Track your accuracy 
                  and identify what conditions you predict best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">2,847</div>
              <div className="text-green-100">Active Players</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">45K+</div>
              <div className="text-green-100">Predictions Made</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">128</div>
              <div className="text-green-100">Hole-in-Ones</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-2xl border-4 border-green-200 p-8 md:p-12 text-center">
          <h2 className="text-4xl font-bold text-green-900 mb-6">
            100% Free to Play
          </h2>
          <p className="text-xl text-green-700 mb-8">
            No subscriptions. No hidden fees. Just predict, compete, and have fun.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-green-900">Unlimited Predictions</div>
                <div className="text-sm text-green-600">Play every trading day</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-green-900">Full Leaderboards</div>
                <div className="text-sm text-green-600">Track all-time and monthly rankings</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-green-900">Friends & Competition</div>
                <div className="text-sm text-green-600">Invite unlimited friends</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-green-900">Performance Analytics</div>
                <div className="text-sm text-green-600">Track your accuracy over time</div>
              </div>
            </div>
          </div>

          <Link to="/signup" className="inline-block bg-gradient-to-r from-green-700 to-green-800 text-yellow-50 px-8 py-4 rounded-lg font-bold text-lg hover:from-green-800 hover:to-green-900 transition-all shadow-lg">
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer className="bg-green-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">Bulligan</span>
            </div>
            <div className="flex gap-6 text-green-100 text-sm">
              <Link to="/how-to-play" className="hover:text-yellow-400 transition-colors">How It Works</Link>
              <Link to="/login" className="hover:text-yellow-400 transition-colors">Sign In</Link>
              <Link to="/signup" className="hover:text-yellow-400 transition-colors">Sign Up</Link>
            </div>
            <div className="text-green-100 text-sm">
              © 2026 Bulligan. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}