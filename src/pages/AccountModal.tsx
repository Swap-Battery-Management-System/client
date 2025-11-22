import { X } from "lucide-react";
import { useState } from "react";
import ResetPassword from "./ResetPassword";
import UpdateUserInfo from "./UpdateUserInfo";
import MyVehicles from "./MyVehicles";
import { useEffect } from "react";

interface Props {
    type: string | null;
    onClose: () => void;
}

export default function AccountModal({ type, onClose }: Props) {
    const [activeTab, setActiveTab] = useState("profile");
    useEffect(() => {
        if (type) setActiveTab(type);
    }, [type]);

    if (!type) return null;

    const tabs = [
        { key: "profile", label: "Thông tin cá nhân" },
        { key: "vehicles", label: "Phương tiện của tôi" },
        { key: "security", label: "Bảo mật tài khoản" },
        { key: "subscription", label: "Gói thuê bao của tôi" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <div className="pb-6">
                        <UpdateUserInfo onSuccess={onClose} />
                    </div>
                );

            case "vehicles":
                return (
                    <div>
                        <MyVehicles />
                    </div>
                );

            case "security":
                return (
                    <div>
                        <h2 className="text-xl font-semibold text-[#38A3A5] mb-4">
                            Bảo mật tài khoản
                        </h2>
                        <ResetPassword />
                    </div>
                );

            case "subscription":
                return (
                    <div>
                        <h2 className="text-xl font-semibold text-[#38A3A5] mb-4">
                            Gói thuê bao hiện tại
                        </h2>
                        <p>Gói SwapNet Premium – Hạn dùng: 30/12/2025</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            {/* Khung chính */}
            <div className="bg-white rounded-2xl w-[850px] max-h-[90vh] shadow-lg relative flex overflow-hidden">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                >
                    <X size={20} />
                </button>

                {/* Sidebar trái (thu nhỏ) */}
                <div className="w-[200px] border-r border-gray-200 p-5 flex-shrink-0 bg-white">
                    <h3 className="text-base font-semibold mb-4 text-[#38A3A5]">Tài khoản</h3>
                    <ul className="space-y-1.5">
                        {tabs.map((tab) => (
                            <li key={tab.key}>
                                <button
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${activeTab === tab.key
                                        ? "bg-[#E6FAF4] text-[#38A3A5] font-medium"
                                        : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Nội dung bên phải */}
                <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
            </div>
        </div>
    );
}
