import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/stores/authStores";
import { toast } from "sonner";
import api from "@/lib/api";

export interface PaymentStatusData {
  transaction?: {
    id: string;
    status: string;
    totalAmount: string;
    paymentMethod?: {
      name: string;
      id: string;
      iconUrl?: string;
      description?: string;
    };
    [key: string]: any;
  };
  invoiceId?: string;
  status?: string; // "processing", "completed", "pending", "failed"
  reason?: string;
  type?: string;
  timestamp?: string;
  [key: string]: any;
}

export function usePaymentSocket(stationId: string) {
  const { user } = useAuth();
  const token = useAuthStore((state) => state.accessToken);

  const [payments, setPayments] = useState<PaymentStatusData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Nhận payment mới từ socket
  const handleNewPayment = useCallback((data: PaymentStatusData) => {
    console.log("Nhận payment mới từ socket:", data);

    // Thêm vào danh sách payments
    setPayments((prev) => [data, ...prev]);
  }, []);

  //  Kết nối socket
  useEffect(() => {
    if (!stationId || !user?.id) return;

    const authToken = token || localStorage.getItem("accessToken");
    if (!authToken) {
      console.warn("⚠ Không có token, bỏ qua kết nối socket.");
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: authToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      secure: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(" Payment socket connected:", newSocket.id);
      newSocket.emit("register", user.id);
      // Chỉ register station nếu user là staff
      if (user.role?.name === "staff") {
        newSocket.emit("register-station", stationId);
      }
    });

    // Lắng nghe các event tùy theo vai trò / hành vi
    if (user.role?.name === "staff") {
      // Staff nhận confirm khi driver chọn phương thức thanh toán
      newSocket.on("payment:confirm", handleNewPayment);
    }

    // driver nhận thông tin khi có hóa đơn cần thanh toán (pending)
    newSocket.on("payment:pending", handleNewPayment);

    // Staff + tất cả người dùng nhận status khi người dùng thanh toán xong
    newSocket.on("payment:status", handleNewPayment);

    newSocket.on("disconnect", (reason) =>
      console.warn("⚠ Payment socket disconnected:", reason)
    );
    newSocket.on("connect_error", (err) =>
      console.error("Payment socket error:", err.message)
    );

    return () => {
      console.log("Ngắt kết nối payment socket...");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [stationId, user?.id, token, handleNewPayment]);




  return { payments, socket };
}
