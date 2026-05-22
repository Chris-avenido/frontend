const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '5174';
export const BASE_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : 'https://backend-1-7zxj.onrender.com/api';

/**
 * Reusable HTTP client for interacting with the backend API.
 */
const api = {
  /**
   * Make a generic request to the API
   */
  request: async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  /**
   * GET request
   */
  get: (endpoint) => api.request(endpoint, { method: 'GET' }),

  /**
   * POST request
   */
  post: (endpoint, body) => api.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
};

export default api;
