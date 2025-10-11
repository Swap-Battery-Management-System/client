import { NavLink } from "react-router-dom";
import {
  Menu,
  User,
  Car,
  Lock,
  LogOut,
  MapPin,
  Calendar,
  History,
  Package,
  DollarSign,
  FileText,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>

      {/* Sidebar chính */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl w-64 transform transition-transform duration-300 z-50 rounded-r-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header logo */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="text-[#38A3A5] hover:text-[#2d898a] transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <NavLink
            to="/trang-chu"
            className="text-2xl font-bold text-[#38A3A5]"
          >
            SwapNet
          </NavLink>
        </div>

        {/* Nội dung sidebar */}
        <nav className="text-gray-700 overflow-y-auto h-[calc(100%-64px)] px-4 py-5">
          {/* Hồ sơ */}
          <div className="mb-6">
            <p className="font-semibold mb-3 text-gray-900">👤 Hồ sơ</p>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <NavItem
                to="/thong-tin-ca-nhan"
                icon={<User />}
                label="Thông tin cá nhân"
                onClick={onClose}
              />
              <NavItem
                to="/phuong-tien-cua-toi"
                icon={<Car />}
                label="Phương tiện của tôi"
                onClick={onClose}
              />
              <NavItem
                to="/cai-dat-bao-mat"
                icon={<Lock />}
                label="Cài đặt bảo mật"
                onClick={onClose}
              />
              <NavItem
                to="/dang-xuat"
                icon={<LogOut />}
                label="Đăng xuất"
                onClick={onClose}
                className="text-red-500 hover:text-red-600"
              />
            </div>
          </div>

          {/* Dịch vụ */}
          <div className="mb-6">
            <p className="font-semibold mb-3 text-gray-900">💡 Dịch vụ</p>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <NavItem
                to="/tim-tram"
                icon={<MapPin />}
                label="Tìm trạm đổi pin"
                onClick={onClose}
              />
              <NavItem
                to="/dat-lich"
                icon={<Calendar />}
                label="Đặt lịch"
                onClick={onClose}
              />
              <NavItem
                to="/lich-su-doi-pin"
                icon={<History />}
                label="Lịch sử đổi pin"
                onClick={onClose}
              />
              <NavItem
                to="/goi-thue-bao"
                icon={<Package />}
                label="Gói thuê bao"
                onClick={onClose}
              />
              <NavItem
                to="/bang-phi"
                icon={<DollarSign />}
                label="Bảng phí"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Hóa đơn */}
          <div className="mb-6">
            <p className="font-semibold mb-3 text-gray-900">🧾 Hóa đơn</p>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <NavItem
                to="/lich-su-thanh-toan"
                icon={<FileText />}
                label="Lịch sử thanh toán"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Hỗ trợ */}
          <div>
            <p className="font-semibold mb-3 text-gray-900">💬 Hỗ trợ</p>
            <div className="ml-3 flex flex-col gap-2 text-sm">
              <NavItem
                to="/bao-cao"
                icon={<MessageSquare />}
                label="Báo cáo sự cố / Feedback"
                onClick={onClose}
              />
              {/* <NavItem
                to="/faq"
                icon={<HelpCircle />}
                label="Câu hỏi thường gặp (FAQ)"
                onClick={onClose}
              /> */}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

/* 🔹 Component con: item menu riêng */
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

function NavItem({ to, icon, label, onClick, className = "" }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e8f7f7] hover:text-[#38A3A5] ${
          isActive ? "bg-[#dff5f5] text-[#38A3A5]" : "text-gray-700"
        } ${className}`
      }
    >
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
