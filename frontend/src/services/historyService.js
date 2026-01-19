import api from './api';

const historyService = {
  async getUserHistory(limit = 30, offset = 0) {
    return api.get(`/history?limit=${limit}&offset=${offset}`);
  },

  async getMulliganStatus() {
    return api.get('/history/mulligans');
  },

  async getBestPerformances() {
    return api.get('/history/best');
  },
};

export default historyService;
