import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function useNotificationSocket(userId: string, onMessage: (data: any) => void) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId) {
            console.warn("⚠️ Không có userId — bỏ qua kết nối socket.");
            return;
        }

        if (socketRef.current) {
            console.log("⚙️ Socket đã tồn tại, bỏ qua tạo mới.");
            return;
        }

        console.log("🔌 Kết nối socket tới:", SOCKET_URL);

        const socket: Socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token: localStorage.getItem("accessToken") },
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            secure: true,
        });

        socketRef.current = socket;

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
            console.log("🧹 Ngắt kết nối socket khi component unmount");
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId, onMessage]);
}
