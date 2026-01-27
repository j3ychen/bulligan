import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Globe, UserPlus, Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LeaderboardPage() {
  const { token } = useAuth();
  const [view, setView] = useState('friends');
  const [timeframe, setTimeframe] = useState('week');
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Friend search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [addingFriend, setAddingFriend] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [view, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [leaderboardRes, rankRes] = await Promise.all([
        fetch(`${API_URL}/api/leaderboard?view=${view}&timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/leaderboard/rank?view=${view}&timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      const leaderboardData = await leaderboardRes.json();
      setLeaderboard(leaderboardData.leaderboard || []);
      setTotalPlayers(leaderboardData.totalPlayers || 0);

      if (rankRes.ok) {
        const rankData = await rankRes.json();
        setUserRank(rankData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setSearchError('Search query must be at least 2 characters');
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);
      setSearchResults([]);

      const response = await fetch(`${API_URL}/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (username) => {
    try {
      setAddingFriend(username);
      setAddSuccess(null);

      const response = await fetch(`${API_URL}/api/friends/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add friend');
      }

      setAddSuccess(`Added ${username} as a friend!`);
      // Update search results to show friend status
      setSearchResults(prev => prev.map(user =>
        user.username === username ? { ...user, isFriend: true } : user
      ));
      // Refresh leaderboard if on friends view
      if (view === 'friends') {
        fetchLeaderboard();
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setAddingFriend(null);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-green-50 text-green-800 border-green-200';
  };

  const getTimeframeLabel = () => {
    const labels = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      alltime: 'All Time'
    };
    return labels[timeframe];
  };

  const getTimeframeSubtitle = () => {
    const now = new Date();
    if (timeframe === 'today') {
      return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (timeframe === 'week') {
      return 'Current Week';
    }
    if (timeframe === 'month') {
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'Since Launch';
  };

  // Get top 3 players
  const topThree = leaderboard.filter(p => p.rank <= 3);
  const firstPlace = topThree.find(p => p.rank === 1);
  const secondPlace = topThree.find(p => p.rank === 2);
  const thirdPlace = topThree.find(p => p.rank === 3);

  // Find current user in leaderboard
  const currentUser = leaderboard.find(p => p.isCurrentUser);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">{getTimeframeSubtitle()}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* View Toggle - Friends vs Global */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setView('friends')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'friends'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
            }`}
          >
            <Users className="w-5 h-5" />
            Friends
          </button>
          <button
            onClick={() => setView('global')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'global'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
            }`}
          >
            <Globe className="w-5 h-5" />
            Global
          </button>
        </div>

        {/* Timeframe Toggle */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {['today', 'week', 'month', 'alltime'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                timeframe === tf
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
              }`}
            >
              {tf === 'today' && 'Today'}
              {tf === 'week' && 'This Week'}
              {tf === 'month' && 'This Month'}
              {tf === 'alltime' && 'All Time'}
            </button>
          ))}
        </div>

        {/* Current View Label */}
        <div className="text-center mb-6">
          <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
            {view === 'friends' ? 'Friends' : 'Global'} - {getTimeframeLabel()}
          </span>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            {secondPlace ? (
              <div className={`bg-white rounded-2xl shadow-xl p-6 text-center transform md:translate-y-4 ${secondPlace.isCurrentUser ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-center mb-3">
                  {getRankIcon(2)}
                </div>
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-gray-700">
                    {secondPlace.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {secondPlace.username}
                  {secondPlace.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                </h3>
                <p className="text-3xl font-bold text-gray-700 mb-2">
                  {secondPlace.score > 0 ? '+' : ''}{secondPlace.score}
                </p>
                <p className="text-sm text-gray-600">
                  {secondPlace.daysPlayed} {secondPlace.daysPlayed === 1 ? 'day' : 'days'}
                </p>
              </div>
            ) : <div />}

            {/* 1st Place */}
            {firstPlace ? (
              <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-2xl p-6 text-center border-2 border-yellow-300 ${firstPlace.isCurrentUser ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-center mb-3">
                  {getRankIcon(1)}
                </div>
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-3 ring-4 ring-yellow-200">
                  <span className="text-3xl font-bold text-yellow-900">
                    {firstPlace.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-1">
                  {firstPlace.username}
                  {firstPlace.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                </h3>
                <p className="text-4xl font-bold text-yellow-800 mb-2">
                  {firstPlace.score > 0 ? '+' : ''}{firstPlace.score}
                </p>
                <p className="text-sm text-yellow-700">
                  {firstPlace.daysPlayed} {firstPlace.daysPlayed === 1 ? 'day' : 'days'}
                </p>
              </div>
            ) : <div />}

            {/* 3rd Place */}
            {thirdPlace ? (
              <div className={`bg-white rounded-2xl shadow-xl p-6 text-center transform md:translate-y-4 ${thirdPlace.isCurrentUser ? 'ring-2 ring-green-500' : ''}`}>
                <div className="flex justify-center mb-3">
                  {getRankIcon(3)}
                </div>
                <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-700">
                    {thirdPlace.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {thirdPlace.username}
                  {thirdPlace.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                </h3>
                <p className="text-3xl font-bold text-orange-700 mb-2">
                  {thirdPlace.score > 0 ? '+' : ''}{thirdPlace.score}
                </p>
                <p className="text-sm text-gray-600">
                  {thirdPlace.daysPlayed} {thirdPlace.daysPlayed === 1 ? 'day' : 'days'}
                </p>
              </div>
            ) : <div />}
          </div>
        )}

        {/* Your Rank Card (Sticky) */}
        {(userRank && userRank.rank) && (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-800 font-medium">Your Rank</p>
                <p className="text-2xl font-bold text-green-900">
                  #{userRank.rank} of {userRank.totalPlayers} {view === 'friends' ? 'friends' : 'players'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-medium">{getTimeframeLabel()}</p>
                <p className="text-2xl font-bold text-green-900">
                  {userRank.score > 0 ? '+' : ''}{userRank.score} ({userRank.daysPlayed} {userRank.daysPlayed === 1 ? 'day' : 'days'})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No scores message */}
        {userRank && !userRank.rank && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-yellow-800">No scores yet for this timeframe. Make a prediction to get on the leaderboard!</p>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b-2 border-green-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-green-900 font-bold">Rank</th>
                    <th className="text-left py-4 px-6 text-green-900 font-bold">Player</th>
                    <th className="text-center py-4 px-6 text-green-900 font-bold">Score</th>
                    <th className="text-center py-4 px-6 text-green-900 font-bold">Days</th>
                    <th className="text-center py-4 px-6 text-green-900 font-bold">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, idx) => (
                    <tr
                      key={player.userId || idx}
                      className={`border-b border-green-50 hover:bg-green-50 transition-colors ${
                        player.isCurrentUser ? 'bg-green-100' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold ${getRankBadge(player.rank)}`}>
                            {player.rank}
                          </span>
                          {getRankIcon(player.rank)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${player.isCurrentUser ? 'text-green-700' : 'text-gray-900'}`}>
                          {player.username}
                          {player.isCurrentUser && <span className="text-green-600 text-sm ml-1">(You)</span>}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-xl font-bold ${player.score < 0 ? 'text-green-700' : player.score > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {player.score > 0 ? '+' : ''}{player.score}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">
                        {player.daysPlayed}
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">
                        {player.avgScore.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No scores yet for this timeframe.</p>
            </div>
          )}
        </div>

        {/* Add Friends Section */}
        {view === 'friends' && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Friends
            </h3>

            {/* Success Message */}
            {addSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">{addSuccess}</p>
              </div>
            )}

            {/* Search Error */}
            {searchError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{searchError}</p>
              </div>
            )}

            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Find Friends'
                )}
              </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 mb-2">Found {searchResults.length} user(s):</p>
                {searchResults.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                        <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-600">Avg: {user.avgScore.toFixed(2)}</p>
                      </div>
                    </div>
                    {user.isFriend ? (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Friend
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(user.username)}
                        disabled={addingFriend === user.username}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {addingFriend === user.username ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* How Rankings Work */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">How Rankings Work</h3>
          <p className="text-blue-800">
            Players are ranked by their cumulative golf score for the period. Lower (more negative) scores win!
            Ties are broken by average score per day played.
          </p>
        </div>

      </div>
    </div>
  );
}
