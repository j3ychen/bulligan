import api from './api';

const predictionService = {
  async submitPrediction(predictedCloseValue, date) {
    return api.post('/predictions', { predictedCloseValue, date });
  },

  async getTodayPrediction() {
    try {
      return await api.get('/predictions/today');
    } catch (error) {
      // Return null if no prediction found for today
      if (error.message.includes('No prediction found')) {
        return null;
      }
      throw error;
    }
  },

  async getPredictionByDate(date) {
    return api.get(`/predictions/${date}`);
  },
};

export default predictionService;
