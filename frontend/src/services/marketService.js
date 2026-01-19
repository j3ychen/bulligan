import api from './api';

const marketService = {
  async getTodayMarketData() {
    return api.get('/market/today');
  },

  async getMarketDataByDate(date) {
    return api.get(`/market/date/${date}`);
  },

  async getMarketDataRange(startDate, endDate) {
    return api.get(`/market/range?startDate=${startDate}&endDate=${endDate}`);
  },
};

export default marketService;
