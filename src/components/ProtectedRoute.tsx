import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  roles: string[];
  children: ReactNode;
}

export const ProtectedRoute=({roles,children}:ProtectedRouteProps)=>{
    const { user, initialized } = useAuth();
     if (!initialized) return null;
    if(!user){
        return <Navigate to={"/"} replace/>
    }

    switch (user.status) {
      case "pending":
        return <Navigate to={`/register/info/${user.id}`} replace />;
      case "inactive":
        return <Navigate to="/" replace />;
      case "blocked":
        return <Navigate to="/" replace />;
    }


    if(!roles.includes(user.role)){
      return <Navigate to={"/"} replace />;
    }
    return<>{children}</>;
}
