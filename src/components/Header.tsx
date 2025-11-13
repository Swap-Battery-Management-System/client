import { useEffect, useState } from "react";
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
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import logo from "/svg.svg";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStores";

interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type: string;
  createdAt?: string;
  createdDate?: string;
  isRead?: boolean;
  status?: string;
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.accessToken);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  const [selectedNoti, setSelectedNoti] = useState<NotificationItem | null>(null);
  const [openModal, setOpenModal] = useState(false);

  // 🧭 Logout
  const handleLogout = () => {
    logout(() => navigate("/", { replace: true }));
  };
  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/notifications/${id}`);
      const detail = res.data?.data?.notification;

      if (detail) {
        setSelectedNoti(detail);
        setOpenModal(true);
      }

      // 🔹 Gọi API đánh dấu đã đọc
      await api.patch(`/notifications/${id}/read`);

      // 🔹 Cập nhật lại danh sách (đổi status)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "Read", isRead: true } : n
        )
      );

      // 🔹 Giảm số lượng chưa đọc
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("❌ Lỗi khi mở chi tiết thông báo:", err);
    }
  };

  // 🔔 Lấy thông báo mới nhất
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications?userId=${user.id}`);
      const list = res.data?.data?.notifications || [];

      // 🔹 Sắp xếp theo thời gian mới nhất
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.createdDate || b.createdAt).getTime() -
          new Date(a.createdDate || a.createdAt).getTime()
      );

      setNotifications(sorted.slice(0, 5)); // ✅ chỉ lấy 5 cái mới nhất

      // 🔹 Đếm thông báo chưa đọc
      const unread = list.filter(
        (n: any) => n.isRead === false || n.status === "Unread"
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("❌ Lỗi khi tải thông báo:", err);
      toast.error("Không thể tải thông báo!");
    }
  };

  // ⚡ Gọi khi load trang
  useEffect(() => {
    fetchNotifications();
  }, [user]);
  // 🔌 Kết nối socket realtime
  useEffect(() => {
    if (!user?.id) return;
    if (!token) {
      console.warn("⚠️ Không có token, bỏ qua kết nối socket.");
      return;
    }

    console.log("🔌 Header kết nối Socket.IO:", SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      secure: true,
    });


    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("register", user.id);
    });

    newSocket.on("notification", (data) => {
      console.log("📩 Nhận thông báo mới (Header):", data);

      const newItem: NotificationItem = {
        id: data.id || Date.now().toString(),
        title: data.title || "",
        message: data.message || "Thông báo mới từ hệ thống.",
        type: data.type || "Alert",
        createdAt: new Date().toISOString(),
        status: "Unread",
      };

      setNotifications((prev) => [newItem, ...prev].slice(0, 5));
      setUnreadCount((prev) => prev + 1);
      toast.info("🔔 " + (data.title || "Bạn có thông báo mới!"));
    });

    newSocket.on("disconnect", (reason) =>
      console.warn("⚠️ Socket disconnected:", reason)
    );

    newSocket.on("connect_error", (err) =>
      console.error("❌ Lỗi socket Header:", err.message)
    );

    return () => {
      console.log("🧹 Ngắt kết nối socket Header...");
      newSocket.disconnect();
    };
  }, [user]);

  // ================== JSX ==================
  return (
    <>
      <header className="bg-white px-8 py-4 flex justify-center">
        <div className="bg-white border border-[#38A3A5] w-full max-w-8xl rounded-full px-6 py-3 flex items-center justify-between">
          {/* Logo + Menu icon */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="text-[#38A3A5] hover:text-[#2d898a] transition"
            >
              <Menu className="w-6 h-6" />
            </button>
            <NavLink to="/" className="flex items-center gap-2 ml-1">
              <img
                src={logo}
                alt="EV Battery Swap Logo"
                className="h-14 w-auto object-contain hover:opacity-90 transition"
              />
            </NavLink>
          </div>

          {/* Navigation Menu */}
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
                state={path === "find-station" ? { openShowModal: true } : null}
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

          {/* Icons: Notifications + Account */}
          <div className="flex items-center gap-4">
            {/* 🔔 Thông báo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative text-[#38A3A5] hover:text-[#2d898a] transition">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-red-500 text-white 
                      text-[10px] font-semibold rounded-full px-1.5 py-[1px] 
                      min-w-[16px] flex items-center justify-center"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                <DropdownMenuLabel className="px-4 py-2 font-semibold text-[#38A3A5]">
                  Thông báo mới nhất
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm">
                      Không có thông báo nào.
                    </div>
                  ) : (
                    notifications.map((item, i) => {
                      const date = new Date(item.createdDate || item.createdAt || "");
                      const formatted = isNaN(date.getTime())
                        ? "—"
                        : date.toLocaleString("vi-VN");

                      const isUnread = item.status === "Unread" || item.isRead === false;

                      return (
                        <DropdownMenuItem
                          key={i}
                          onClick={() => handleViewDetail(item.id)}
                          className={cn(
                            "flex flex-col items-start py-2 px-4 gap-1 cursor-pointer transition-all border-l-4",
                            isUnread
                              ? "bg-emerald-50 border-l-emerald-400 hover:bg-emerald-100"
                              : "bg-white border-l-transparent hover:bg-gray-50"
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm line-clamp-2",
                              isUnread
                                ? "font-semibold text-emerald-700"
                                : "text-gray-800"
                            )}
                          >
                            {item.title || item.message}
                          </p>
                          <span className="text-xs text-gray-500">{formatted}</span>
                        </DropdownMenuItem>
                      );
                    })

                  )}
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink
                    to="/home/notifications"
                    className="w-full text-center text-[#38A3A5] py-2 hover:underline"
                  >
                    Xem tất cả thông báo
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 👤 Dropdown tài khoản */}
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

      <AccountModal type={activeModal} onClose={() => setActiveModal(null)} />
      {/* Modal chi tiết thông báo */}
      {openModal && selectedNoti && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-[90%] p-6 relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-emerald-600 mb-2">
              {selectedNoti.title || "Chi tiết thông báo"}
            </h3>
            <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
              {selectedNoti.message}
            </p>

            <div className="text-xs text-gray-500 text-right">
              {new Date(selectedNoti.createdAt || "").toLocaleString("vi-VN")}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600"
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
