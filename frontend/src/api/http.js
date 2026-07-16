import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const SERVER_URL = API_URL.replace(/\/api$/, "");

export const http = axios.create({ baseURL: API_URL });

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "";
    if (error.response?.status === 401 && (message.includes("không tồn tại") || message.includes("khong ton tai") || message.includes("không hợp lệ") || message.includes("khong hop le"))) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
