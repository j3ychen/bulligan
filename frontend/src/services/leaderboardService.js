import api from './api';

const leaderboardService = {
  async getMonthlyLeaderboard(year, month) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/leaderboard/monthly${query}`);
  },

  async getWeeklyLeaderboard(year, week) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (week) params.append('week', week);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/leaderboard/weekly${query}`);
  },

  async getUserMonthlyRank(year, month) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/leaderboard/rank/monthly${query}`);
  },
};

export default leaderboardService;
