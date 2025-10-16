import { NavLink, replace, useNavigate } from "react-router-dom";
import { Bell, User, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import LocationPermissionModal from "./LocationPermissionModal";
import { useNotification } from "@/hooks/useNotification";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout, message } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<"success" | "error">("success");
  const [showModal, setShowModal] = useState(false);
  const {success, error}=useNotification();

  useEffect(() => {
    if (!message) return;

    if (type === "success") {
       success({message:message});
    } else {
      error({message:message});
    }
  }, [message, type]);

  const handleLogout = async () => {
    logout(() =>
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000)
    ); // truyền callback redirect
  };

  const notifications = [
    {
      title: "Đặt lịch đổi pin thành công cho xe Wave Alpha - Trạm Bến Thành",
      time: "5 phút trước",
    },
    {
      title: "Trạm Nguyễn Văn Linh hiện còn 3 pin trống, hãy đến sớm nhé!",
      time: "30 phút trước",
    },
    {
      title:
        "Lịch đổi pin ngày mai (11/10) lúc 09:00, vui lòng kiểm tra lại thông tin trước khi đến",
      time: "1 giờ trước",
    },
    {
      title:
        "Hệ thống đang bảo trì tạm thời tại trạm Quận 7, dự kiến hoàn thành trong hôm nay",
      time: "2 giờ trước",
    },
  ];
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
            <NavLink to="" className="text-2xl font-bold text-[#38A3A5]">
              SwapNet
            </NavLink>
          </div>

          {/* Menu */}
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
                to={`${path}`}
                state={path==="find-station"?{openShowModal:true}:null}
                end={path === ""}
                className={({ isActive }) =>
                  `hover:text-[#38A3A5] transition ${
                    isActive ? "font-bold text-[#38A3A5]" : ""
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          {/* Icons: Thông báo + Account */}
          <div className="flex items-center gap-4">
            {/* Dropdown Thông báo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative text-[#38A3A5] hover:text-[#2d898a] transition">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 p-0 overflow-hidden"
              >
                <DropdownMenuLabel className="px-4 py-2 font-semibold text-[#38A3A5]">
                  Thông báo
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Danh sách thông báo */}
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((item, i) => (
                    <DropdownMenuItem
                      key={i}
                      className="flex flex-col items-start py-2 px-4 gap-1 cursor-pointer hover:bg-[#f3fdfa]"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate w-full">
                        {item.title}
                      </p>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </DropdownMenuItem>
                  ))}
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink
                    to="/notifications"
                    className="w-full text-center text-[#38A3A5] py-2 hover:underline"
                  >
                    Xem tất cả thông báo
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dropdown Tài khoản */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[#38A3A5] hover:text-[#2d898a] transition">
                  <User className="w-6 h-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/profile">Thông tin cá nhân</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/my-vehicles">Phương tiện của tôi</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/security-settings">Cài đặt bảo mật</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/my-subscription-packages">
                    Gói thuê bao của tôi
                  </NavLink>
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

      {/* Sidebar
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )} */}
    </>
  );
}
