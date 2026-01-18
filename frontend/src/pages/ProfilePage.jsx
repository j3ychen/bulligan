import React, { useState } from 'react';
import { Trophy, Calendar, Award, Target, Sun, CloudRain, Wind, Cloud, XCircle, Settings } from 'lucide-react';

export default function ProfilePage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  
  const user = {
    username: 'player7',
    memberSince: 'November 2025',
    totalRoundsPlayed: 3,
    totalHolesPlayed: 45,
    careerAvgScore: 0.13,
    bestRoundScore: -8,
    holeInOnes: 0
  };

  const currentMonth = {
    month: 'January 2026',
    totalScore: -5,
    holesPlayed: 15,
    avgScore: -0.33,
    rank: 7,
    totalPlayers: 142,
    eagles: 2,
    birdies: 6,
    pars: 5,
    bogeys: 2,
    doubleBogeys: 0,
    worse: 0,
    perfectDaysScore: -8,
    perfectDaysPlayed: 12,
    weatherDaysScore: 3,
    weatherDaysPlayed: 3
  };

  const calendarData = [
    { date: 'Dec 19', day: 'Thu', score: -1, scoreName: 'Birdie', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Dec 20', day: 'Fri', score: 0, scoreName: 'Par', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Dec 23', day: 'Mon', score: -1, scoreName: 'Birdie', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Dec 24', day: 'Tue', score: 1, scoreName: 'Bogey', weather: 'thunderstorm', isMulligan: false, isHoliday: false },
    { date: 'Dec 26', day: 'Thu', score: null, scoreName: 'Holiday', weather: null, isMulligan: false, isHoliday: true },
    { date: 'Dec 27', day: 'Fri', score: -2, scoreName: 'Eagle', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Dec 30', day: 'Mon', score: 0, scoreName: 'Par', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Dec 31', day: 'Tue', score: -1, scoreName: 'Birdie', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 1', day: 'Wed', score: null, scoreName: 'Holiday', weather: null, isMulligan: false, isHoliday: true },
    { date: 'Jan 2', day: 'Thu', score: 0, scoreName: 'Par', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 3', day: 'Fri', score: -1, scoreName: 'Birdie', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 6', day: 'Mon', score: 0, scoreName: 'Par', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 7', day: 'Tue', score: -1, scoreName: 'Birdie', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 8', day: 'Wed', score: 0, scoreName: 'Par', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 9', day: 'Thu', score: -2, scoreName: 'Eagle', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 10', day: 'Fri', score: 1, scoreName: 'Bogey', weather: 'fog', isMulligan: false, isHoliday: false },
    { date: 'Jan 13', day: 'Mon', score: 2, scoreName: 'Double', weather: 'thunderstorm', isMulligan: false, isGentlemans: true },
    { date: 'Jan 14', day: 'Tue', score: 0, scoreName: 'Par', weather: 'perfect', isMulligan: false, isHoliday: false },
    { date: 'Jan 15', day: 'Wed', score: 1, scoreName: 'Bogey', weather: 'tornado', isMulligan: true, isHoliday: false },
    { date: 'Jan 16', day: 'Thu', score: -1, scoreName: 'Birdie', weather: 'perfect', isMulligan: false, isHoliday: false },
  ];

  const getScoreColor = (score, isHoliday) => {
    if (isHoliday || score === null) return 'bg-gray-50 text-gray-300 opacity-50';
    if (score < 0) return 'bg-green-100 text-green-800';
    if (score === 0) return 'bg-slate-100 text-slate-700';
    return 'bg-red-100 text-red-800';
  };

  const getWeatherIcon = (weather) => {
    if (!weather) return null;
    switch(weather) {
      case 'tornado': return <Wind className="w-3 h-3 text-purple-600" />;
      case 'thunderstorm': return <CloudRain className="w-3 h-3 text-blue-600" />;
      case 'fog': return <Cloud className="w-3 h-3 text-gray-500" />;
      default: return <Sun className="w-3 h-3 text-yellow-500" />;
    }
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-lg p-8 mb-8 text-center border-2 border-green-700">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl font-bold text-green-900 mx-auto mb-4">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">{user.username}</h1>
          <p className="text-green-100">Member since {user.memberSince}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Career Stats
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-900">{user.totalRoundsPlayed}</div>
              <div className="text-sm text-green-700">Rounds Played</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-900">{user.totalHolesPlayed}</div>
              <div className="text-sm text-green-700">Total Holes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-900">+{user.careerAvgScore}</div>
              <div className="text-sm text-green-700">Career Avg</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-green-900">{user.bestRoundScore}</div>
              <div className="text-sm text-green-700">Best Round</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-green-900">{user.holeInOnes}</div>
              <div className="text-sm text-green-700">Hole-in-Ones</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-700" />
              {currentMonth.month} Round
            </h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border-2 border-green-300 rounded-lg text-green-900 font-semibold"
            >
              <option value="2026-01">January 2026</option>
              <option value="2025-12">December 2025</option>
              <option value="2025-11">November 2025</option>
            </select>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Total Score</div>
              <div className="text-3xl font-bold text-green-900">{currentMonth.totalScore}</div>
              <div className="text-xs text-green-600">Rank #{currentMonth.rank} of {currentMonth.totalPlayers}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Holes Played</div>
              <div className="text-3xl font-bold text-green-900">{currentMonth.holesPlayed}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-green-900">{currentMonth.avgScore}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-700 mb-1">Best Hole</div>
              <div className="text-3xl font-bold text-green-900">-2</div>
              <div className="text-xs text-green-600">Eagle</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-3">Score Distribution</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center text-sm">
              <div>
                <div className="font-bold text-green-900">{currentMonth.eagles}</div>
                <div className="text-green-700">Eagles 🦅</div>
              </div>
              <div>
                <div className="font-bold text-green-900">{currentMonth.birdies}</div>
                <div className="text-green-700">Birdies 🐦</div>
              </div>
              <div>
                <div className="font-bold text-green-900">{currentMonth.pars}</div>
                <div className="text-green-700">Pars ⛳</div>
              </div>
              <div>
                <div className="font-bold text-green-900">{currentMonth.bogeys}</div>
                <div className="text-green-700">Bogeys</div>
              </div>
              <div>
                <div className="font-bold text-green-900">{currentMonth.doubleBogeys}</div>
                <div className="text-green-700">Doubles</div>
              </div>
              <div>
                <div className="font-bold text-green-900">{currentMonth.worse}</div>
                <div className="text-green-700">Worse</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Performance by Conditions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span className="text-green-900 font-medium">Normal Days</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-900">{currentMonth.perfectDaysScore}</div>
                  <div className="text-xs text-green-600">{currentMonth.perfectDaysPlayed} holes</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-600" />
                  <span className="text-green-900 font-medium">Weather Events</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-700">+{currentMonth.weatherDaysScore}</div>
                  <div className="text-xs text-green-600">{currentMonth.weatherDaysPlayed} holes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6">
          <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-700" />
            Recent History (Last 20 Trading Days)
          </h2>

          <div className="grid grid-cols-5 gap-3">
            {calendarData.map((day, idx) => (
              <div
                key={idx}
                className={`relative rounded-lg p-3 text-center transition-all ${
                  day.isHoliday 
                    ? 'cursor-default' 
                    : 'cursor-pointer hover:ring-2 hover:ring-green-400'
                } ${getScoreColor(day.score, day.isHoliday)}`}
                title={day.isHoliday ? `${day.date} - Market Holiday` : (day.score !== null ? `${day.scoreName}: ${day.score > 0 ? '+' : ''}${day.score}` : '')}
              >
                <div className="text-xs font-semibold mb-1">{day.day}</div>
                <div className="text-lg font-bold mb-1">{day.date}</div>
                {day.isHoliday ? (
                  <div className="text-xs">Holiday</div>
                ) : day.score !== null ? (
                  <>
                    <div className="text-sm font-bold">
                      {day.score > 0 ? '+' : ''}{day.score}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getWeatherIcon(day.weather)}
                      {day.isMulligan && (
                        <span className="text-xs font-bold text-yellow-700">M</span>
                      )}
                      {day.isGentlemans && (
                        <XCircle className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-green-700">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span>Under par</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-slate-100 rounded"></div>
              <span>Par</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Over par</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded opacity-50"></div>
              <span>Market holiday</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-yellow-700">M</span>
              <span>Mulligan</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>No prediction</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}