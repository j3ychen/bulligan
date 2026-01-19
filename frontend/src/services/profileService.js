import api from './api';

const profileService = {
  async getUserStats() {
    return api.get('/profile/stats');
  },

  async getMonthlyPerformance(year, month) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/profile/monthly${query}`);
  },
};

export default profileService;
