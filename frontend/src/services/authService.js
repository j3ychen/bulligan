import api from './api';

const authService = {
  async register(username, email, password) {
    const response = await api.post('/auth/register', { username, email, password }, { skipAuth: true });
    if (response.token) {
      api.setToken(response.token);
    }
    return response;
  },

  async login(username, password) {
    const response = await api.post('/auth/login', { username, password }, { skipAuth: true });
    if (response.token) {
      api.setToken(response.token);
    }
    return response;
  },

  logout() {
    api.removeToken();
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  isAuthenticated() {
    return !!api.getToken();
  },

  getToken() {
    return api.getToken();
  },
};

export default authService;
