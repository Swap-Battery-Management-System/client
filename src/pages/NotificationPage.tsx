import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  AlertCircle,
  Battery,
  CalendarCheck,
  CreditCard,
  User,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNotificationStore } from "@/stores/notificationStore";
import { useSocket } from "@/components/SocketProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface Notification {
  notification_id: string;
  message: string;
  type: string;
  created_date: string;
  status: string;
}

export default function NotificationPage() {
  const { user } = useAuth();
  const { socket } = useSocket(); // ⭐ Lấy socket từ provider
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    setUnreadCount,
    decreaseUnread,
    increaseUnread,
    resetUnread,
    setLatestNotifications,
    updateOneAsRead
  } = useNotificationStore();


  // ⭐ Icon hiển thị từng loại
  const typeIcons: Record<string, React.ReactNode> = {
    Booking: <CalendarCheck className="w-5 h-5 text-emerald-500" />,
    Battery: <Battery className="w-5 h-5 text-cyan-500" />,
    Account: <User className="w-5 h-5 text-indigo-500" />,
    Alert: <AlertCircle className="w-5 h-5 text-rose-500" />,
    Payment: <CreditCard className="w-5 h-5 text-amber-500" />,
  };

  // ⭐ Hàm xử lý socket realtime
  const handleNewNotification = useCallback((data: any) => {
    console.log("📩 Realtime notification:", data);
    increaseUnread();

    const newItem: Notification = {
      notification_id: data.id || Date.now().toString(),
      message: data.message,
      type: data.type || "Alert",
      created_date: new Date().toISOString(),
      status: "Unread",
    };

    setNotifications((prev) => [newItem, ...prev]);
  }, []);

  // ⭐ LISTEN socket — KHÔNG CONNECT
  useEffect(() => {
    if (!socket) return;

    socket.on("notification", handleNewNotification);
    console.log("🔔 NotificationPage: listening for notification...");

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  // ⭐ Load lịch sử thông báo
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await api.get(`/notifications?userId=${user.id}`);
      const raw = res.data?.data?.notifications || [];

      const formatted = raw
        .map((n: any) => ({
          notification_id: n.id || n.notification_id,
          message: n.message,
          type: n.type || "Alert",
          created_date: n.createdAt || n.created_date,
          status:
            n.isRead === true || n.status === "Read" ? "Read" : "Unread",
        }))
        .sort(
          (a: any, b: any) =>
            new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime()
        );

      setNotifications(formatted);
      setUnreadCount(formatted.filter((x: any) => x.status === "Unread").length);
      setLatestNotifications(formatted.slice(0, 5));

    } catch (err) {
      console.error("❌ Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ⭐ Xem chi tiết
  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/notifications/${id}`);
      const detailData = res.data?.data?.notification;

      setDetail(detailData);
      setOpen(true);

      // Đánh dấu đã đọc
      await api.patch(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      console.error("❌ Lỗi khi lấy chi tiết:", err);
    }
  };

  // ⭐ Xóa thông báo
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Đã xóa thông báo");
      setOpen(false);
      await fetchNotifications();
    } catch (err) {
      toast.error("Không thể xóa thông báo!");
    }
  };

  // ⭐ Lọc danh sách
  const filtered =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter((n) => n.status === "Unread")
        : notifications.filter((n) => n.status === "Read");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="text-gray-500 animate-pulse">
          Đang tải thông báo...
        </span>
      </div>
    );
  }

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
          onClick={() => setConfirmOpen(true)}
          className="border-emerald-400 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
        >
          Đánh dấu tất cả đã đọc
        </Button>

      </div>

      {/* Bộ lọc */}
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

      {/* Danh sách */}
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
                <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
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

      {/* Dialog chi tiết */}
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
              disabled={detail?.isRead}
              onClick={async () => {
                if (detail?.id) {
                  await api.patch(`/notifications/${detail.id}/read`);
                  decreaseUnread();
                  toast.success("Đã đánh dấu thông báo là đã đọc");
                  await fetchNotifications();
                }
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 shadow-md transition",
                detail?.isRead
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600"
              )}
            >
              <CheckCircle className="w-4 h-4" />
              Đã đọc
            </Button>

          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl border border-emerald-100 bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Xác nhận hành động
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Bạn có chắc chắn muốn đánh dấu <b>tất cả</b> thông báo là <b>đã đọc</b> không?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </Button>

            <Button
              onClick={async () => {
                try {
                  await api.patch("/notifications/read");
                  resetUnread();
                  toast.success("Tất cả thông báo đã được đánh dấu là đã đọc");
                  setConfirmOpen(false);
                  await fetchNotifications();
                } catch (err) {
                  toast.error("Không thể đánh dấu thông báo đã đọc!");
                  console.error("❌ Lỗi khi cập nhật:", err);
                }
              }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow hover:from-cyan-600 hover:to-emerald-600"
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
