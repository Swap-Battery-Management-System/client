// stores/authStores.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  refreshTokenFn: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      refreshTokenFn: async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Refresh failed");
          const data = await res.json();
          set({ accessToken: data.accessToken });
        } catch (err) {
          await get().logout();
          throw err;
        }
      },
      logout: async () => {
        set({ accessToken: null, refreshToken: null });
        window.location.href = "/"; 
      },
    }),
    { name: "auth-storage" } // persist key
  )
);
