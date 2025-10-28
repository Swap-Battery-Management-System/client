import { useEffect, useState } from "react";
import { Bell, AlertCircle, Battery, CalendarCheck, CreditCard, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Notification {
  notification_id: string;
  message: string;
  type: string;
  created_date: string;
  status: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  const typeIcons: Record<string, React.ReactNode> = {
    Booking: <CalendarCheck className="w-5 h-5 text-emerald-500" />,
    Battery: <Battery className="w-5 h-5 text-cyan-500" />,
    Account: <User className="w-5 h-5 text-indigo-500" />,
    Alert: <AlertCircle className="w-5 h-5 text-rose-500" />,
    Payment: <CreditCard className="w-5 h-5 text-amber-500" />,
  };

  // 🔹 Mock data (dùng khi API chưa có dữ liệu thật)
  const mockNotifications: Notification[] = [
    {
      notification_id: "n1",
      message: "Đặt lịch đổi pin của bạn đã được xác nhận thành công.",
      type: "Booking",
      created_date: new Date().toISOString(),
      status: "Unread",
    },
    {
      notification_id: "n2",
      message: "Pin #A0923 tại trạm Nguyễn Văn Cừ đã hoàn tất sạc và sẵn sàng.",
      type: "Battery",
      created_date: new Date(Date.now() - 3600000).toISOString(),
      status: "Unread",
    },
    {
      notification_id: "n3",
      message: "Giao dịch thanh toán gói Swap+ của bạn đã được xử lý.",
      type: "Payment",
      created_date: new Date(Date.now() - 7200000).toISOString(),
      status: "Read",
    },
    {
      notification_id: "n4",
      message: "Tài khoản của bạn đã được nâng cấp lên gói Premium.",
      type: "Account",
      created_date: new Date(Date.now() - 10800000).toISOString(),
      status: "Read",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/notifications");
        const data = res?.data?.length ? res.data : mockNotifications;
        setNotifications(data);
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" })));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const filtered =
    filter === "All"
      ? notifications
      : filter === "Unread"
        ? notifications.filter((n) => n.status === "Unread")
        : notifications.filter((n) => n.status === "Read");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="text-gray-500 animate-pulse">Đang tải thông báo...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
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

      {/* Filter buttons */}
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
            {f === "All" && "Tất cả"}
            {f === "Unread" && "Chưa đọc"}
            {f === "Read" && "Đã đọc"}
          </Button>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Không có thông báo nào{" "}
            {filter === "Unread" ? "chưa đọc" : "trong danh sách"}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.notification_id}
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
    </div>
  );
}
