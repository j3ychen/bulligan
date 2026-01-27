import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Award, Flame, RefreshCw, Users, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile and friends in parallel
      const [profileRes, friendsRes] = await Promise.all([
        fetch(`${API_URL}/api/users/${user.userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/friends`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.error || 'Failed to fetch profile');
      }

      const profileData = await profileRes.json();
      setProfile(profileData);

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score <= -2) return 'text-blue-600';
    if (score === -1) return 'text-green-600';
    if (score === 0) return 'text-gray-600';
    if (score === 1) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getScoreName = (golfScore) => {
    if (golfScore <= -4) return 'Condor';
    if (golfScore === -3) return 'Albatross';
    if (golfScore === -2) return 'Eagle';
    if (golfScore === -1) return 'Birdie';
    if (golfScore === 0) return 'Par';
    if (golfScore === 1) return 'Bogey';
    if (golfScore === 2) return 'Double Bogey';
    if (golfScore === 3) return 'Triple Bogey';
    return 'Worse';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-900">Error loading profile</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const bestScoreName = getScoreName(profile.stats.bestScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* User Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">{profile.username}</h1>
          <p className="text-gray-600">Member since {formatJoinDate(profile.createdAt)}</p>
        </div>

        {/* Stats Cards Row 1 */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Days Played</p>
            <p className="text-3xl font-bold text-blue-900">{profile.stats.totalDaysPlayed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-green-900">
              {profile.stats.avgScore !== null ? profile.stats.avgScore.toFixed(2) : '—'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-orange-900">{profile.stats.currentStreak} days</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Best Score</p>
            <p className="text-3xl font-bold text-purple-900">
              {profile.stats.bestScore !== null ? profile.stats.bestScore : '—'}
            </p>
            {profile.stats.bestScore !== null && (
              <p className="text-xs text-gray-500">({bestScoreName})</p>
            )}
          </div>
        </div>

        {/* Stats Cards Row 2 */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {profile.mulligans && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Mulligans</p>
              <p className="text-3xl font-bold text-green-900">{profile.mulligans.available}/2</p>
              <p className="text-xs text-gray-500">Used: {profile.mulligans.usedTotal} total</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Hole in Ones</p>
            <p className="text-3xl font-bold text-yellow-900">{profile.scoreDistribution.holeInOnes}</p>
            <p className="text-xs text-gray-500">(on Par 3 days)</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Eagles</p>
            <p className="text-3xl font-bold text-blue-900">{profile.scoreDistribution.eagles}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center gap-2 mb-2">
              <Users className="w-6 h-6 text-green-600" />
              <Globe className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Rank</p>
            <div className="flex justify-center gap-4">
              <div>
                <p className="text-xl font-bold text-green-900">
                  {profile.rank.friends ? `#${profile.rank.friends.rank}` : '—'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile.rank.friends ? `of ${profile.rank.friends.total} friends` : 'no friends yet'}
                </p>
              </div>
              <div className="border-l border-gray-200 pl-4">
                <p className="text-xl font-bold text-gray-700">
                  {profile.rank.global ? `#${profile.rank.global.rank}` : '—'}
                </p>
                <p className="text-xs text-gray-500">global</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Performance Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-6">Recent Performance</h2>

          {profile.recentScores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-green-100">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                    <th className="text-center py-3 px-4 text-gray-600 font-semibold">Par</th>
                    <th className="text-center py-3 px-4 text-gray-600 font-semibold">Score</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">Predicted</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">Actual</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.recentScores.map((score, idx) => (
                    <tr key={idx} className="border-b border-green-50 hover:bg-green-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatDate(score.date)}
                        {score.usedMulligan && (
                          <span className="ml-2 text-green-600" title="Mulligan used">
                            <RefreshCw className="w-4 h-4 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">{score.par}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold ${getScoreColor(score.golfScore)}`}>
                          {score.golfScore > 0 ? '+' : ''}{score.golfScore} ({score.scoreName})
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">${score.predictedClose.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right text-gray-900">${score.actualClose.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right text-gray-600">{score.deviationPct.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No scores yet. Make your first prediction!</p>
            </div>
          )}
        </div>

        {/* Score Distribution & Achievements */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Score Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Hole in Ones</span>
                <span className="font-bold text-gray-900">{profile.scoreDistribution.holeInOnes}</span>
              </div>
              {profile.scoreDistribution.condors > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">Condors (-4)</span>
                  <span className="font-bold text-gray-900">{profile.scoreDistribution.condors}</span>
                </div>
              )}
              {profile.scoreDistribution.albatrosses > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">Albatrosses (-3)</span>
                  <span className="font-bold text-gray-900">{profile.scoreDistribution.albatrosses}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Eagles (-2)</span>
                <span className="font-bold text-gray-900">{profile.scoreDistribution.eagles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Birdies (-1)</span>
                <span className="font-bold text-gray-900">{profile.scoreDistribution.birdies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Pars (0)</span>
                <span className="font-bold text-gray-900">{profile.scoreDistribution.pars}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-medium">Bogeys (+1)</span>
                <span className="font-bold text-gray-900">{profile.scoreDistribution.bogeys}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-medium">Double Bogeys (+2)</span>
                <span className="font-bold text-gray-900">{profile.scoreDistribution.doubleBogeys}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-700 font-medium">Triple+ Bogeys</span>
                <span className="font-bold text-gray-900">
                  {profile.scoreDistribution.tripleBogeys + profile.scoreDistribution.worse}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Achievements</h3>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${profile.scoreDistribution.holeInOnes > 0 ? '' : 'opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full ${profile.scoreDistribution.holeInOnes > 0 ? 'bg-yellow-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ace</p>
                  <p className="text-sm text-gray-600">Hit a hole in one</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 ${profile.scoreDistribution.eagles >= 5 ? '' : 'opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full ${profile.scoreDistribution.eagles >= 5 ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <span className="text-2xl">🦅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Eagle Eye</p>
                  <p className="text-sm text-gray-600">
                    {profile.scoreDistribution.eagles >= 5
                      ? '5 Eagles achieved!'
                      : `${profile.scoreDistribution.eagles}/5 Eagles`}
                  </p>
                  {profile.scoreDistribution.eagles < 5 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (profile.scoreDistribution.eagles / 5) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-3 ${profile.stats.longestStreak >= 10 ? '' : 'opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full ${profile.stats.longestStreak >= 10 ? 'bg-orange-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">On Fire</p>
                  <p className="text-sm text-gray-600">
                    {profile.stats.longestStreak >= 10
                      ? '10-day streak achieved!'
                      : `Longest streak: ${profile.stats.longestStreak}/10 days`}
                  </p>
                  {profile.stats.longestStreak < 10 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (profile.stats.longestStreak / 10) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-3 ${profile.stats.totalDaysPlayed >= 20 ? '' : 'opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full ${profile.stats.totalDaysPlayed >= 20 ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Consistent</p>
                  <p className="text-sm text-gray-600">
                    {profile.stats.totalDaysPlayed >= 20
                      ? '20 days played!'
                      : `${profile.stats.totalDaysPlayed}/20 days played`}
                  </p>
                  {profile.stats.totalDaysPlayed < 20 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (profile.stats.totalDaysPlayed / 20) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-900">Your Friends ({friends.length})</h3>
          </div>
          {friends.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {friends.slice(0, 6).map((friend) => (
                <div key={friend.userId} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white font-bold">{friend.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{friend.username}</p>
                    <p className="text-sm text-gray-600">Avg: {friend.avgScore.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No friends yet. Add some from the leaderboard!</p>
            </div>
          )}
          {friends.length > 6 && (
            <p className="mt-4 text-center text-sm text-gray-500">
              And {friends.length - 6} more...
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
