import { useAuthStore } from "@/stores/authStores";
import axios, { type AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",

  },

});

// Request interceptor: tự động thêm Authorization header
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  console.log("Request /auth/me token:", token);
  if (token && config.headers) {
    config.headers.set?.("Authorization", `Bearer ${token}`);
  }

  return config;
});


// Response interceptor: tự động refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshToken(); // lấy token mới
      const token = useAuthStore.getState().accessToken;
      originalRequest.headers["Authorization"] = `Bearer ${token}`;
      return api(originalRequest); // retry request với token mới
    }

    return Promise.reject(error);
  }
);

export default api;