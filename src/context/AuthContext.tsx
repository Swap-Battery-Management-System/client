import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import type { User } from "@/types/user";
import { create } from "zustand";
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
  const accessToken = useAuthStore.getState().accessToken;

  //kiem tra token con khong
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("auth/me", { withCredentials: true });
        console.log("useAuth:", res.data);
        const userData = res.data.data.user;
        const user: User = {
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
        };
        console.log("user: ", user);
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    fetchUser();
  }, []);

  //log out
  const logout = async (onSuccess?: () => void) => {
    try {
      await api.get("/auth/logout", { withCredentials: true });
      console.log("log out");
      setUser(null);
      setMessage("Đăng xuất thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.log("thất bại", err);
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
