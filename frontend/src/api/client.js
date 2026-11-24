import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const api = axios.create({ baseURL, withCredentials: true });
const refreshClient = axios.create({ baseURL, withCredentials: true });

let accessToken = null;
let refreshPromise = null;
const listeners = new Set();

export function updateSession(session) {
  accessToken = session?.accessToken || null;
  listeners.forEach((listener) => listener(session || null));
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function performRefresh() {
  return refreshClient.post("/auth/refresh-token").then((response) => {
    updateSession(response.data);
    return response.data;
  });
}

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const request = error.config;
    const isAuthRequest = /\/auth\/(login|reg|refresh-token|logout)(\?|$)/.test(request?.url || "");
    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    return refreshSession()
      .then(() => api(request))
      .catch((refreshError) => {
        updateSession(null);
        return Promise.reject(refreshError);
      });
  },
);

export default api;
