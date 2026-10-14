import api from './api';
import { EVALUATION_METRICS } from '../mocks/mockData';

export const USE_MOCK = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const evalService = {
  /**
   * Fetch latest evaluation benchmark results
   */
  async getEvaluationResults() {
    if (USE_MOCK) {
      await delay(350);
      return { ...EVALUATION_METRICS };
    }
    const response = await api.get('/evaluation/results');
    return response.data;
  },

  /**
   * Trigger a new automated RAG evaluation run
   */
  async runEvaluation(onProgress) {
    if (USE_MOCK) {
      if (onProgress) onProgress(15);
      await delay(400);
      if (onProgress) onProgress(40);
      await delay(500);
      if (onProgress) onProgress(75);
      await delay(500);
      if (onProgress) onProgress(100);

      // Return updated metrics with subtle variations
      return {
        ...EVALUATION_METRICS,
        summary: {
          ...EVALUATION_METRICS.summary,
          totalTestCases: 250,
          evaluatedDate: new Date().toISOString(),
        },
      };
    }

    const response = await api.post('/evaluation/run');
    return response.data;
  },
};
