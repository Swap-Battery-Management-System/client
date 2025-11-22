
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { StationProvider } from "./context/StationContext.tsx";
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
import { SocketProvider } from "@/components/SocketProvider.tsx";



createRoot(document.getElementById("root")!).render(

  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <StationProvider>
            <App />
          </StationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>

);
