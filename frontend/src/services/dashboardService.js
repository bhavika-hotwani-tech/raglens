import api from './api';
import { DASHBOARD_STATS } from '../mocks/mockData';

export const USE_MOCK = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  /**
   * Fetch comprehensive dashboard telemetry & stats
   */
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(350);
      return { ...DASHBOARD_STATS };
    }
    const response = await api.get('/stats');
    return response.data;
  },
};
