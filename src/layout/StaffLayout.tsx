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
  UserCheck,
  RefreshCcw,
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
      path: "/staff",
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
    {
      name: "Check-in tại trạm",
      path: "walkin-swap",
      icon: <UserCheck size={18} />,
    },
    {
      name: "Quản lý Swap Session",
      path: "swap-session",
      icon: <RefreshCcw size={18} />,
    },
    { name: "Báo cáo trạm", path: "support", icon: <FileBarChart size={18} /> },
    {
      name: "Sự cố & kiểm tra an toàn",
      path: "safety",
      icon: <ShieldCheck size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-sm flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="EV Battery Swap Logo"
              className="h-12 w-auto object-contain"
            />
          </NavLink>

          <p className="text-sm mt-2 text-gray-600">
            Hello,{" "}
            <span className="font-semibold">{user?.fullName || "Staff"}</span>
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/staff"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
               ${isActive
                  ? "bg-[#E6F7F7] text-[#38A3A5]"
                  : "text-gray-700 hover:bg-[#F0FAFA] hover:text-[#38A3A5]"
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t text-sm space-y-2">
          <NavLink
            to="/staff/profile"
            className="flex items-center gap-2 text-[#38A3A5] hover:underline"
          >
            <Settings size={16} />
            Cài đặt cá nhân
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:underline"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );

}
