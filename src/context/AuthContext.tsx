import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStores";
import api from "@/lib/api";
import type { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  initialized: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      const fetchUser = async () => {
        try {
          const res = await api.get("/auth/me", { withCredentials: true });
          setUser(res.data.data.user);
        } catch {
          await logout();
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };
      fetchUser();
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, initialized, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
