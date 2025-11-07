import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Car,
  BatteryCharging,
  CreditCard,
  FileText,
  ShieldCheck,
  Bell,
  UserCog,
  LogOut,
  List,
  Box,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "/png.png";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const links = [
    // Nhóm 1: Tổng quan & quản lý
    {
      name: "Tổng quan hệ thống",
      path: "dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Quản lý người dùng",
      path: "manage-users",
      icon: <Users size={18} />,
    },
    {
      name: "Quản lý trạm",
      path: "manage-stations",
      icon: <Store size={18} />,
    },
    {
      name: "Quản lý xe",
      path: "manage-vehicles",
      icon: <Car size={18} />,
    },
    {
      name: "Quản lý pin",
      path: "manage-battery",
      icon: <BatteryCharging size={18} />,
    },
    {
      name: "Danh sách loại pin",
      path: "battery-types",
      icon: <List size={18} />,
    },
    {
      name: "Model xe",
      path: "vehicle-models",
      icon: <Box size={18} />,
    },
    {
      name: "Báo cáo doanh thu",
      path: "revenue-reports",
      icon: <CreditCard size={18} />,
    },
    {
      name: "Gói thuê bao",
      path: "manage-subscription",
      icon: <FileText size={18} />,
    },
    {
      name: "Bảng phí",
      path: "damage-fee",
      icon: <FileText size={18} />,
    },

    // Nhóm 2: Bảo mật & cảnh báo
    {
      name: "Phân quyền & Bảo mật",
      path: "security",
      icon: <ShieldCheck size={18} />,
    },
    {
      name: "Trung tâm cảnh báo",
      path: "alerts",
      icon: <Bell size={18} />,
    },
  ];

  const footerLinks = [
    {
      name: "Hồ sơ quản trị",
      path: "/profile",
      icon: <UserCog size={16} />,
    },
    {
      name: "Đăng xuất",
      action: handleLogout,
      icon: <LogOut size={16} />,
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
            Hello, <span className="font-semibold">admin</span>
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* Nhóm 1: Tổng quan & quản lý */}
          {links.slice(0, 9).map((link) => (
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
          <hr className="my-2 border-gray-300" /> {/* Gạch ngang nhóm */}
          {/* Nhóm 2: Bảo mật & cảnh báo */}
          {links.slice(9).map((link) => (
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

        {/* Footer */}
        <div className="mt-auto p-4 border-t text-sm space-y-2">
          {footerLinks.map((link) =>
            link.path ? (
              <NavLink
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 text-[#38A3A5] hover:underline"
              >
                {link.icon}
                {link.name}
              </NavLink>
            ) : (
              <button
                key={link.name}
                onClick={link.action}
                className="flex items-center gap-2 text-[#38A3A5] hover:underline"
              >
                {link.icon}
                {link.name}
              </button>
            )
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
