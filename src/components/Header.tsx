import { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, User, Menu } from "lucide-react";
import AccountModal from "@/pages/AccountModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import logo from "/svg.svg";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNotificationStore } from "@/stores/notificationStore";
import { useSocket } from "@/components/SocketProvider";
import { cn } from "@/lib/utils";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { socket } = useSocket();

  // ⭐ Zustand store
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const increaseUnread = useNotificationStore((s) => s.increaseUnread);
  const decreaseUnread = useNotificationStore((s) => s.decreaseUnread);
  const updateOneAsRead = useNotificationStore((s) => s.updateOneAsRead);

  const latestNotifications = useNotificationStore((s) => s.latestNotifications);
  const setLatestNotifications = useNotificationStore((s) => s.setLatestNotifications);

  // Local UI
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedNoti, setSelectedNoti] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  // ⭐ Logout
  const handleLogout = () => logout(() => navigate("/", { replace: true }));

  // ⭐ Load thông báo từ BE
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications?userId=${user.id}`);
      const raw = res.data?.data?.notifications || [];

      const formatted = raw.map((n: any) => ({
        notification_id: n.id,
        message: n.message,
        type: n.type,
        created_date: n.createdAt,
        status: n.isRead ? "Read" : "Unread",
      }));

      const sorted = formatted.sort(
        (a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );

      setLatestNotifications(sorted.slice(0, 5));
      setUnreadCount(sorted.filter((x: any) => x.status === "Unread").length);
    } catch (err) {
      console.error("❌ Lỗi tải thông báo:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 2000);

    return () => clearInterval(interval);
  }, [user?.id]);


  useEffect(() => {
    if (!socket) return;

    const handler = (data: any) => {
      const newItem = {
        notification_id: data.id,
        message: data.message,
        type: data.type,
        created_date: data.createdAt || new Date().toISOString(),
        status: "Unread",
      };

      // ⭐ Dùng callback — KHÔNG BAO GIỜ dùng latestNotifications trực tiếp
      setLatestNotifications((prev: any[]) => [newItem, ...prev].slice(0, 5));

      increaseUnread();
      toast.info("🔔 " + data.message);
    };

    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [socket]);

  // ⭐ Xem chi tiết
  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/notifications/${id}`);
      const detail = res.data?.data?.notification;

      setSelectedNoti(detail);
      setOpenModal(true);

      // BE update
      await api.patch(`/notifications/${id}/read`);

      // Sync Zustand
      updateOneAsRead(id);
      decreaseUnread();
    } catch (err) {
      console.error("❌ Lỗi mở chi tiết:", err);
    }
  };

  return (
    <>
      <header className="bg-white px-8 py-4 flex justify-center">
        <div className="bg-white border border-[#38A3A5] w-full max-w-8xl rounded-full px-6 py-3 flex items-center justify-between">

          {/* Logo + Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="text-[#38A3A5] hover:text-[#2d898a]"
            >
              <Menu className="w-6 h-6" />
            </button>

            <NavLink to="/" className="flex items-center gap-2 ml-1">
              <img src={logo} className="h-14 w-auto" />
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8 text-sm font-medium text-black">
            {[
              ["", "Trang chủ"],
              ["find-station", "Tìm trạm"],
              ["booking", "Đặt lịch"],
              ["booking-history", "Lịch sử đặt lịch"],
              ["register-vehicle", "Đăng ký xe"],
              ["support", "Hỗ trợ"],
            ].map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                end={path === ""}
                className={({ isActive }) =>
                  `hover:text-[#38A3A5] transition ${isActive ? "font-bold text-[#38A3A5]" : ""
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* 🔔 Notifications */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative text-[#38A3A5] hover:text-[#2d898a] transition">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-80 p-0 overflow-hidden">
                <DropdownMenuLabel className="px-4 py-2 font-semibold text-[#38A3A5]">
                  Thông báo mới nhất
                </DropdownMenuLabel>

                <div className="max-h-60 overflow-y-auto">
                  {latestNotifications.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">Không có thông báo.</p>
                  ) : (
                    latestNotifications.map((item: any, i: number) => {
                      const unread = item.status === "Unread";
                      return (
                        <DropdownMenuItem
                          key={i}
                          onClick={() => handleViewDetail(item.notification_id)}
                          className={cn(
                            "flex flex-col items-start py-2 px-4 gap-1 border-l-4 cursor-pointer",
                            unread
                              ? "bg-emerald-50 border-l-emerald-400"
                              : "bg-white border-l-transparent"
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm line-clamp-2",
                              unread ? "font-semibold text-emerald-700" : "text-gray-800"
                            )}
                          >
                            {item.message}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(item.created_date).toLocaleString("vi-VN")}
                          </span>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <NavLink
                    to="/home/notifications"
                    className="w-full text-center py-2 text-[#38A3A5]"
                  >
                    Xem tất cả thông báo
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[#38A3A5] hover:text-[#2d898a] transition">
                  <User className="w-6 h-6" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setActiveModal("profile")}>
                  Thông tin cá nhân
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setActiveModal("vehicles")}>
                  Phương tiện của tôi
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setActiveModal("security")}>
                  Cài đặt bảo mật
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setActiveModal("subscription")}>
                  Gói thuê bao của tôi
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer hover:bg-red-50"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Modal chi tiết */}
      <AccountModal type={activeModal} onClose={() => setActiveModal(null)} />

      {openModal && selectedNoti && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[380px] p-6 relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-emerald-600 mb-2">
              {selectedNoti.title || "Chi tiết thông báo"}
            </h3>

            <p className="text-sm text-gray-700 whitespace-pre-line">
              {selectedNoti.message}
            </p>

            <div className="text-xs text-gray-500 text-right mt-3">
              {new Date(selectedNoti.createdAt || selectedNoti.created_date).toLocaleString(
                "vi-VN"
              )}
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
