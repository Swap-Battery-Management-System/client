import { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

interface SocketCtx {
    socket: any;
}

const SocketContext = createContext<SocketCtx>({ socket: null });

export function SocketProvider({ children }: any) {
    const { user } = useAuth();
    const token = localStorage.getItem("accessToken");
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        if (!token || !user?.id) return;

        const s = socketService.connect(token, user.id);
        setSocket(s);

        s.on("connect", () => {
            console.log("🔌 SOCKET CONNECTED:", s.id);
            s.emit("register:user", user.id); // ✔ EMIT ĐÚNG EVENT BE YÊU CẦU
        });

        return () => {
            socketService.disconnect();
        };
    }, [user?.id]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
