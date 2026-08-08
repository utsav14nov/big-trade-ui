import axios from 'axios';

// Access token lives ONLY in memory (a module variable), never in localStorage.
// This is the key XSS defense: even if a script runs, it can't read the token
// from storage. The refresh token is an httpOnly cookie the JS can't touch either.
let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api/v1',
  withCredentials: true,   // send the httpOnly refresh cookie on /auth calls
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// On 401, try one silent refresh, then replay the original request.
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried && !original.url.includes('/auth/')) {
      original._retried = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh');
        const { data } = await refreshing;
        refreshing = null;
        setAccessToken(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// --- typed-ish API helpers ---
export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const tradesApi = {
  list: (params) => api.get('/trades', { params }),
  create: (body) => api.post('/trades', body),
  get: (id) => api.get(`/trades/${id}`),
  update: (id, body) => api.patch(`/trades/${id}`, body),
};

export const analyticsApi = {
  summary: (params) => api.get('/analytics/summary', { params }),
};
