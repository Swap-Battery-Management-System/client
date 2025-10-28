import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BatteryCharging,
  CalendarCheck,
  FileBarChart,
  ShieldCheck,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "/png.png";
export default function StaffLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout(() => {
      navigate("/");
    })
  };
  const links = [
    {
      name: "Dashboard",
      path: "dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Quản lý pin",
      path: "manage-battery",
      icon: <BatteryCharging size={18} />,
    },
    {
      name: "Đặt lịch khách hàng",
      path: "manage-booking",
      icon: <CalendarCheck size={18} />,
    },
    { name: "Báo cáo trạm", path: "reports", icon: <FileBarChart size={18} /> },
    {
      name: "Sự cố & kiểm tra an toàn",
      path: "safety",
      icon: <ShieldCheck size={18} />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <NavLink to="/" className="flex items-center gap-2 ml-1">
            <img
              src={logo}
              alt="EV Battery Swap Logo"
              className="h-14 w-auto object-contain hover:opacity-90 transition"
            />
          </NavLink>

          <p className="text-sm mt-1 text-gray-600">
            Hello, <span className="font-semibold">Staff Name</span>
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition-all duration-200
                ${isActive
                  ? "bg-[#E6F7F7] text-[#38A3A5] border-l-4 border-[#38A3A5]"
                  : "text-gray-700 hover:bg-[#E6F7F7] hover:text-[#38A3A5]"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto p-4 border-t text-sm space-y-2">
          <NavLink
            to="/settings"
            className="flex items-center gap-2 text-[#38A3A5] hover:underline"
          >
            <Settings size={16} />
            Cài đặt cá nhân
          </NavLink>
          <NavLink
            to="/support"
            className="flex items-center gap-2 text-[#38A3A5] hover:underline"
          >
            <LifeBuoy size={16} />
            Hỗ trợ kỹ thuật
          </NavLink>
          <button
            className="flex items-center gap-2 text-[#38A3A5] hover:underline"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
