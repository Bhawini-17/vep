import axios from "axios";

/**
 * Central Axios instance for the whole app.
 * Base URL comes from your Vite env variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string, // e.g. http://localhost:5000/api
  withCredentials: true                           // keep cookies if you ever add them
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
