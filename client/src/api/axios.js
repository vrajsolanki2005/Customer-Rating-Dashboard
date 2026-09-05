import axios from "axios";
import { getStoredToken, clearStoredAuth } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_WHITELIST = ["/auth/login", "/auth/signup"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthRoute = AUTH_WHITELIST.some((path) => url.includes(path));

    if (status === 401 && !isAuthRoute) {
      clearStoredAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?reason=expired");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

