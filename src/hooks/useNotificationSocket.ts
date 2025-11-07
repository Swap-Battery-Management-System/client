import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://api.swapnet.io.vn";

export function useNotificationSocket(userId: string, onMessage: (data: any) => void) {
    useEffect(() => {
        if (!userId) {
            console.warn("⚠️ Không có userId — bỏ qua kết nối socket.");
            return;
        }

        console.log("🔌 Kết nối socket tới:", SOCKET_URL);

        const socket: Socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token: localStorage.getItem("accessToken") },
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
            socket.emit("register", userId);
        });

        socket.on("notification", (data) => {
            console.log("🔔 Nhận thông báo realtime:", data);
            onMessage(data);
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ Socket disconnected:", reason);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Lỗi kết nối socket:", err.message);
        });

        return () => {
            console.log("🧹 Ngắt kết nối socket");
            socket.disconnect();
        };
    }, [userId, onMessage]);
}
