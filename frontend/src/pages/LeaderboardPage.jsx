import React, { useState } from 'react';
import { Trophy, Users, TrendingUp, Medal, Target } from 'lucide-react';

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState('monthly');
  const [currentUser] = useState('player7');
  
  const monthlyData = [
    { rank: 1, username: 'MarketMaster', score: -15, holesPlayed: 18, avgScore: -0.83, holeInOnes: 2, isCurrentUser: false },
    { rank: 2, username: 'BullRider99', score: -8, holesPlayed: 18, avgScore: -0.44, holeInOnes: 1, isCurrentUser: false },
    { rank: 3, username: 'IndexHunter', score: -5, holesPlayed: 17, avgScore: -0.29, holeInOnes: 0, isCurrentUser: false },
    { rank: 4, username: 'VolTrader', score: -3, holesPlayed: 18, avgScore: -0.17, holeInOnes: 1, isCurrentUser: false },
    { rank: 5, username: 'GreenJacket', score: -1, holesPlayed: 16, avgScore: -0.06, holeInOnes: 0, isCurrentUser: false },
    { rank: 6, username: 'SPYGuy', score: 0, holesPlayed: 18, avgScore: 0.00, holeInOnes: 0, isCurrentUser: false },
    { rank: 7, username: 'player7', score: 2, holesPlayed: 15, avgScore: 0.13, holeInOnes: 0, isCurrentUser: true },
    { rank: 8, username: 'ChartChaser', score: 4, holesPlayed: 14, avgScore: 0.29, holeInOnes: 0, isCurrentUser: false },
    { rank: 9, username: 'BearMarket', score: 7, holesPlayed: 18, avgScore: 0.39, holeInOnes: 0, isCurrentUser: false },
    { rank: 10, username: 'DipBuyer', score: 12, holesPlayed: 16, avgScore: 0.75, holeInOnes: 0, isCurrentUser: false },
  ];

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-green-700';
  };

  const getMedalIcon = (rank) => {
    if (rank <= 3) return <Medal className={`w-6 h-6 ${getMedalColor(rank)}`} />;
    return <span className="text-green-700 font-semibold">{rank}</span>;
  };

  const getScoreColor = (score) => {
    if (score < 0) return 'text-green-700 font-bold';
    if (score === 0) return 'text-slate-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">Leaderboard</h1>
              <p className="text-green-100">January 2026 Championship Round</p>
            </div>
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-yellow-400 text-green-900'
                  : 'bg-green-700 bg-opacity-40 text-green-100 hover:bg-opacity-60'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-yellow-400 text-green-900'
                  : 'bg-green-700 bg-opacity-40 text-green-100 hover:bg-opacity-60'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setViewMode('alltime')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'alltime'
                  ? 'bg-yellow-400 text-green-900'
                  : 'bg-green-700 bg-opacity-40 text-green-100 hover:bg-opacity-60'
              }`}
            >
              All-Time Avg
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-700" />
              <span className="text-sm text-green-700 font-semibold">Your Rank</span>
            </div>
            <div className="text-3xl font-bold text-green-900">#7</div>
            <div className="text-sm text-green-600">of 142 players</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              <span className="text-sm text-green-700 font-semibold">Your Score</span>
            </div>
            <div className="text-3xl font-bold text-green-900">+2</div>
            <div className="text-sm text-green-600">15 holes played</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-200">
          <div className="bg-green-800 px-4 py-3 grid grid-cols-11 gap-2 text-sm font-semibold text-yellow-100">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Holes</div>
            <div className="col-span-1 text-center">Avg</div>
          </div>

          <div className="divide-y divide-green-100">
            {monthlyData.map((player) => (
              <div
                key={player.username}
                className={`px-4 py-4 grid grid-cols-11 gap-2 items-center transition-colors ${
                  player.isCurrentUser
                    ? 'bg-yellow-50 border-l-4 border-yellow-400'
                    : 'hover:bg-green-50'
                }`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getMedalIcon(player.rank)}
                </div>

                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${player.isCurrentUser ? 'text-green-900' : 'text-green-800'}`}>
                      {player.username}
                      {player.isCurrentUser && (
                        <span className="ml-2 text-xs bg-yellow-400 text-green-900 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                  {player.holeInOnes > 0 && (
                    <div className="text-xs text-yellow-600 font-semibold mt-1">
                      ⛳ {player.holeInOnes} Hole-in-One{player.holeInOnes > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className={`col-span-2 text-center text-2xl ${getScoreColor(player.score)}`}>
                  {player.score > 0 ? '+' : ''}{player.score}
                </div>

                <div className="col-span-2 text-center text-green-700 font-medium">
                  {player.holesPlayed}
                </div>

                <div className={`col-span-1 text-center font-medium ${getScoreColor(player.avgScore)}`}>
                  {player.avgScore > 0 ? '+' : ''}{player.avgScore.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 px-4 py-3 text-center">
            <button className="text-green-700 font-semibold hover:text-green-900 transition-colors">
              View Full Leaderboard (142 players) →
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-4 border-2 border-green-200">
          <h3 className="text-sm font-semibold text-green-900 mb-2">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-green-700">
            <div><span className="font-semibold">Score:</span> Total strokes over/under par</div>
            <div><span className="font-semibold">Holes:</span> Trading days participated</div>
            <div><span className="font-semibold">Avg:</span> Average score per hole</div>
          </div>
        </div>

      </div>
    </div>
  );
}