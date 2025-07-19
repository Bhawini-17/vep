// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // backend port
});

export default api;
