import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (ẩn/hiện theo trạng thái) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Phần nội dung chính */}
      <div className="flex flex-col flex-1 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 p-4 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
