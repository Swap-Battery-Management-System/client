import type { Role } from "@/types/roles";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  username?: string;
  role: Role;
  status: String;
}

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
  

  //kiem tra token con khong
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("auth/me", { withCredentials: true });
        console.log("useAuth:", res.data);
        const userData = res.data.user;
        const user: User = {
          id: userData._id,
          username: userData.username,
          role: userData.roles.name,
          status: userData.status,
        };
        console.log("user",user);
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
  const logout = async (onSuccess?:()=>void) => {
    try {
      await api.post("/auth/logout",{}, { withCredentials: true });
      console.log("log out");
      setUser(null);
      setMessage("Đăng xuất thành công!");
      if(onSuccess) onSuccess();      
    } catch(err) {
      console.log("thất bại",err);
      setMessage("Đăng xuất thất bại!");
    }finally{

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
