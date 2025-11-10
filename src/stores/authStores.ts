import { create } from "zustand";
import api from "@/lib/api";
import type { User } from "@/types/user";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  initialized: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setInitialized: (init: boolean) => void;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  initialized: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setInitialized: (init) => set({ initialized: init }),

 refreshToken: async () => {
  try {
    const res = await api.get("/auth/refresh", { withCredentials: true });
    set({ accessToken: res.data.data.accessToken, initialized: true });
    return res.data.data.accessToken;
  } catch {
    set({ accessToken: null, initialized: true });
    throw new Error("Refresh token failed");
  }
},

  logout: async () => {
    try {
      await api.get("/auth/logout", {
        withCredentials: true,
        headers: { "skip-auth-refresh": "true" },
      });
    } catch {}
    set({ accessToken: null, user: null });
    // window.location.href = "/"; 
  },
}));
