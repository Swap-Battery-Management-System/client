import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import type { User } from "@/types/user";
import { useAuthStore } from "@/stores/authStores";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  message: string;
  logout: (onSuccess?: () => void) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshTokenFn = useAuthStore((s) => s.refreshTokenFn);
  const logoutStore = useAuthStore((s) => s.logout);

  // Khi reload: refresh token nếu cần
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (accessToken) {
          // token đã có sẵn → fetch user
          const res = await api.get("/auth/me", { withCredentials: true });
          const userData = res.data.data.user;
          setUser({
            id: userData.id,
            username: userData.username,
            fullName: userData.fullName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            dateOfBirth: userData.dateOfBirth,
            gender: userData.gender,
            address: userData.address,
            avatarUrl: userData.avatarUrl,
            role: userData.role,
            status: userData.status,
            googleId: userData.googleId,
            createdAt: userData.createdAt,
          });
        } else {
          // nếu chưa có token → thử refresh token
          await refreshTokenFn();
          const res = await api.get("/auth/me", { withCredentials: true });
          const userData = res.data.data.user;
          setUser({
            id: userData.id,
            username: userData.username,
            fullName: userData.fullName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            dateOfBirth: userData.dateOfBirth,
            gender: userData.gender,
            address: userData.address,
            avatarUrl: userData.avatarUrl,
            role: userData.role,
            status: userData.status,
            googleId: userData.googleId,
            createdAt: userData.createdAt,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
        await logoutStore();
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    init();
  }, [accessToken, refreshTokenFn, logoutStore]);

  const logout = async (onSuccess?: () => void) => {
    setLoading(true);
    try {
      await api.get("/auth/logout", { withCredentials: true });
      await logoutStore();
      setUser(null);
      setMessage("Đăng xuất thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Logout failed", err);
      setMessage("Đăng xuất thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, logout, message, initialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
