import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  AlertCircle,
  Battery,
  CalendarCheck,
  CreditCard,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStores";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, Trash2 } from "lucide-react";
interface Notification {
  notification_id: string;
  message: string;
  type: string;
  created_date: string;
  status: string;
}

export default function NotificationPage() {
  const { user } = useAuth();
  const token = useAuthStore((state) => state.accessToken); // hook nằm ở top-level

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://api.swapnet.io.vn";

  const typeIcons: Record<string, React.ReactNode> = {
    Booking: <CalendarCheck className="w-5 h-5 text-emerald-500" />,
    Battery: <Battery className="w-5 h-5 text-cyan-500" />,
    Account: <User className="w-5 h-5 text-indigo-500" />,
    Alert: <AlertCircle className="w-5 h-5 text-rose-500" />,
    Payment: <CreditCard className="w-5 h-5 text-amber-500" />,
  };
  const [selected, setSelected] = useState<Notification | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [open, setOpen] = useState(false);


  // Nhận thông báo realtime
  const handleNewNotification = useCallback((data: any) => {
    console.log("📩 Nhận thông báo mới từ socket:", data);
    const newItem: Notification = {
      notification_id: data.id || Date.now().toString(),
      message: data.message || "Thông báo mới từ hệ thống.",
      type: data.type || "Alert",
      created_date: new Date().toISOString(),
      status: "Unread",
    };
    setNotifications((prev) => [newItem, ...prev]);
  }, []);

  // Kết nối socket
  useEffect(() => {
    if (!user?.id) {
      console.log("⏳ Chưa có user, chưa connect socket...");
      return;
    }

    console.log("🔌 Đang kết nối Socket.IO đến:", SOCKET_URL);
    console.log("🔑 Token hiện tại:", token || localStorage.getItem("accessToken"));

    const authToken = token || localStorage.getItem("accessToken");
    if (!authToken) {
      console.warn("⚠️ Không có token, bỏ qua kết nối socket.");
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: authToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      secure: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("register", user.id);
    });

    newSocket.on("notification", handleNewNotification);
    newSocket.on("disconnect", (reason) => console.warn("⚠️ Socket disconnected:", reason));
    newSocket.on("connect_error", (err) => console.error("❌ Lỗi kết nối socket:", err.message));

    return () => {
      console.log("🧹 Ngắt kết nối socket...");
      newSocket.disconnect();
    };
  }, [user, token, handleNewNotification]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        console.log("📡 Gọi API /notifications?userId=" + user.id);
        const res = await api.get(`/notifications?userId=${user.id}`);

        // Đúng cấu trúc của BE SwapNet
        const raw = res?.data?.data?.notifications || [];
        console.log("API trả về:", raw);

        if (Array.isArray(raw)) {
          const formatted = raw
            .map((n: any) => ({
              notification_id: n.id || n.notification_id,
              message: n.message,
              type: n.type || "Alert",
              created_date: n.createdAt || n.created_date,
              // Đồng bộ trạng thái đọc từ BE
              status:
                n.isRead === true || n.status === "Read"
                  ? "Read"
                  : "Unread",
            }))
            .sort(
              (a, b) =>
                new Date(b.created_date).getTime() -
                new Date(a.created_date).getTime()
            );

          setNotifications(formatted);
        }
        else {
          console.warn("⚠️ Dữ liệu không phải array:", res.data);
          setNotifications([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải thông báo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);


  // Đánh dấu tất cả là đã đọc
  const markAllRead = async () => {
    try {
      console.log("📨 PATCH /notifications/read-all cho user:", user?.id);
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" })));
      console.log("✅ Đã đánh dấu tất cả là Read");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", err);
    }
  };

  //  Lọc danh sách
  const filtered =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter((n) => n.status === "Unread")
        : notifications.filter((n) => n.status === "Read");

  //  Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="text-gray-500 animate-pulse">Đang tải thông báo...</span>
      </div>
    );
  }
  const handleViewDetail = async (id: string) => {
    try {
      // Gọi API chi tiết
      const res = await api.get(`/notifications/${id}`);
      const detailData = res.data?.data?.notification;
      setDetail(detailData);
      setOpen(true);


      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === id ? { ...n, status: "Read" } : n
        )
      );
    } catch (err) {
      console.error("❌ Lỗi khi lấy chi tiết thông báo:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.notification_id !== id));
      setOpen(false);
    } catch (err) {
      console.error("❌ Lỗi khi xóa thông báo:", err);
    }
  };

  // UI
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
          <Bell className="w-6 h-6 text-emerald-500" />
          Trung tâm thông báo
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          className="border-emerald-400 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {["All", "Unread", "Read"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full transition-all duration-200",
              filter === f
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow"
                : "border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            )}
          >
            {f === "All" ? "Tất cả" : f === "Unread" ? "Chưa đọc" : "Đã đọc"}
          </Button>
        ))}
      </div>

      <Separator className="my-4" />

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Không có thông báo nào {filter === "Unread" ? "chưa đọc" : "trong danh sách"}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.notification_id}
              onClick={() => handleViewDetail(n.notification_id)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]",
                n.status === "Unread"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-white border-gray-200"
              )}
            >
              <div>{typeIcons[n.type] || <AlertCircle className="w-5 h-5 text-gray-400" />}</div>

              <div className="flex-1">
                <p className="text-sm text-gray-800 leading-snug">
                  {n.message}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span className="capitalize">{n.type}</span>
                  <span>{new Date(n.created_date).toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {n.status === "Unread" && (
                <Badge className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow">
                  Mới
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl shadow-2xl border border-emerald-100 bg-white/95 backdrop-blur-sm">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Bell className="w-5 h-5 text-emerald-500" />
              {detail?.title || "Chi tiết thông báo"}
            </DialogTitle>

            <DialogDescription className="text-xs text-gray-500 flex items-center justify-between">
              <span>{new Date(detail?.createdAt).toLocaleString("vi-VN")}</span>
              {detail?.type && (
                <span className="px-2 py-[2px] rounded-full bg-emerald-100 text-emerald-600 text-[11px] font-medium">
                  {detail.type}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <p className="whitespace-pre-line text-gray-700 leading-relaxed text-sm">
              {detail?.message || "Không có nội dung chi tiết."}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => handleDelete(detail?.id)}
              className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </Button>

            <Button
              onClick={() => {
                if (detail?.id)
                  api.patch(`/notifications/${detail.id}/read`).then(() => {
                    setNotifications(prev =>
                      prev.map(n =>
                        n.notification_id === detail.id
                          ? { ...n, status: "Read" }
                          : n
                      )
                    );
                  });
                setOpen(false);
              }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 flex items-center gap-2 shadow-md transition"
            >
              <CheckCircle className="w-4 h-4" /> Đã đọc
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
