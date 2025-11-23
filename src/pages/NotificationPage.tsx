// ======================= IMPORTS =======================
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

// ======================= INTERFACES =======================
interface Notification {
  notification_id: string;
  message: string;
  type: string;
  created_date: string;
  status: "Unread" | "Read";
}

// ======================= MAIN COMPONENT =======================
export default function NotificationPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

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
    updateOneAsRead,
  } = useNotificationStore();

  // ======================= ICON MAPPING =======================
  const typeIcons: Record<string, React.ReactNode> = {
    Booking: <CalendarCheck className="w-5 h-5 text-emerald-500" />,
    Battery: <Battery className="w-5 h-5 text-cyan-500" />,
    Account: <User className="w-5 h-5 text-indigo-500" />,
    Alert: <AlertCircle className="w-5 h-5 text-rose-500" />,
    Payment: <CreditCard className="w-5 h-5 text-amber-500" />,
  };

  // ======================= SOCKET HANDLE =======================
  const handleNewNotification = useCallback((data: any) => {
    increaseUnread();

    const newItem: Notification = {
      notification_id: data.id,
      message: data.message,
      type: data.type || "Alert",
      created_date: new Date().toISOString(),
      status: "Unread",
    };

    setNotifications((prev) => [newItem, ...prev]);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", handleNewNotification);

    return () => socket.off("notification", handleNewNotification);
  }, [socket, handleNewNotification]);

  // ======================= FETCH LIST =======================
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await api.get(`/notifications?userId=${user.id}`);
      const raw = res.data?.data?.notifications || [];

      const formatted: Notification[] = raw
        .map((n: any) => ({
          notification_id: n.id,
          message: n.message,
          type: n.type || "Alert",
          created_date: n.createdAt,
          status: n.isRead ? "Read" : "Unread",
        }))
        .sort(
          (a: any, b: any) =>
            new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime()
        );

      setNotifications(formatted);
      setUnreadCount(formatted.filter((x) => x.status === "Unread").length);
      setLatestNotifications(formatted.slice(0, 5));
    } catch (err) {
      console.error("❌ Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ======================= VIEW DETAIL (NO REFETCH) =======================
  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/notifications/${id}`);
      const detailData = res.data?.data?.notification;

      setDetail(detailData);
      setOpen(true);

      if (detailData.isRead) return;

      await api.patch(`/notifications/${id}/read`);

      // Update UI directly
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, status: "Read" } : n
        )
      );

      decreaseUnread();
      updateOneAsRead(id);
    } catch (err) {
      console.error("❌ View detail error:", err);
    }
  };

  // ======================= DELETE NOTIFICATION =======================
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Đã xóa thông báo");

      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== id)
      );

      setOpen(false);
    } catch {
      toast.error("Không thể xóa thông báo!");
    }
  };

  // ======================= FILTER =======================
  const filtered =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter((n) => n.status === "Unread")
        : notifications.filter((n) => n.status === "Read");

  // ======================= UI LOADING =======================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="text-gray-500 animate-pulse">
          Đang tải thông báo...
        </span>
      </div>
    );
  }

  // ======================= RETURN UI =======================
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
          <Bell className="w-6 h-6 text-emerald-500" />
          Trung tâm thông báo
        </h1>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="border-emerald-400 text-emerald-600 hover:bg-emerald-50"
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-4">
        {["All", "Unread", "Read"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full",
              filter === f
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                : "border-emerald-300 text-emerald-600"
            )}
          >
            {f === "All"
              ? "Tất cả"
              : f === "Unread"
                ? "Chưa đọc"
                : "Đã đọc"}
          </Button>
        ))}
      </div>

      <Separator className="my-4" />

      {/* LIST */}
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
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:shadow-md transition",
                n.status === "Unread"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-white border-gray-200"
              )}
            >
              <div>
                {typeIcons[n.type] || (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-800">{n.message}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{n.type}</span>
                  <span>
                    {new Date(n.created_date).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {n.status === "Unread" && (
                <Badge className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
                  Mới
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========== DIALOG ========== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl shadow-lg border border-emerald-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-emerald-600" />
              {detail?.title || "Chi tiết thông báo"}
            </DialogTitle>

            <DialogDescription className="flex justify-between text-xs text-gray-500">
              <span>
                {new Date(detail?.createdAt).toLocaleString("vi-VN")}
              </span>

              {detail?.type && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[11px]">
                  {detail.type}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <p className="text-gray-700 mt-4 whitespace-pre-line">
            {detail?.message}
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => handleDelete(detail.id)}
              className="border-rose-400 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </Button>

            <Button
              disabled={detail?.isRead}
              onClick={async () => {
                await api.patch(`/notifications/${detail.id}/read`);

                setNotifications((prev) =>
                  prev.map((n) =>
                    n.notification_id === detail.id
                      ? { ...n, status: "Read" }
                      : n
                  )
                );

                updateOneAsRead(detail.id);
                decreaseUnread();

                setDetail({ ...detail, isRead: true });
                toast.success("Đã đánh dấu là đã đọc");
              }}
              className={cn(
                "flex items-center gap-2",
                detail?.isRead
                  ? "bg-gray-200 text-gray-400"
                  : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
              )}
            >
              <CheckCircle className="w-4 h-4" /> Đã đọc
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== DIALOG READ ALL ========== */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-xl border border-emerald-100 shadow">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Xác nhận
            </DialogTitle>

            <DialogDescription className="text-gray-500">
              Bạn muốn đánh dấu <b>tất cả</b> thông báo là đã đọc?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Hủy
            </Button>

            <Button
              onClick={async () => {
                await api.patch("/notifications/read");

                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, status: "Read" }))
                );

                resetUnread();
                toast.success("Đã đánh dấu tất cả đã đọc");

                setConfirmOpen(false);
              }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
