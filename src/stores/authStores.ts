import api from "@/lib/api";
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
   refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),

  refreshToken: async () => {
    try {
      const res = await api.get("/auth/refresh", { withCredentials: true });
      const newToken = res.data.data.accessToken;
      set({ accessToken: newToken });
      console.log("Token refreshed:", res.data);
    } catch (err) {
      console.log("Refresh token failed", err);
      set({ accessToken: null });
    }
  },
}));