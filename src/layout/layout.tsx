import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Nội dung chính */}
      <div className="flex flex-col flex-1 transition-all duration-300">
        {/* Header cố định trên cùng */}
        <div className="sticky top-0 z-50">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Phần cuộn nội dung */}
        <main
          className={`flex-1 overflow-y-auto p-4 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
