import React, { useState } from "react";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Car, Hash, KeyRound } from "lucide-react";
import Header from "../components/Header"; // ✅ thêm Header
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterVehicle() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        license_plate: "",
        model: "",
        vin: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await axios.post(`${API_URL}/vehicles`, {
                user_id: user.user_id,
                license_plate: form.license_plate,
                model: form.model,
                vin: form.vin,
            });
            setMessage("✅ Đăng ký phương tiện thành công!");
            setTimeout(() => navigate("/phuong-tien-cua-toi"), 1000);
        } catch (err) {
            setMessage("❌ Không thể đăng ký xe, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Khi nhấn icon menu ở Header
    const handleMenuClick = () => {
        console.log("📂 Sidebar menu clicked");
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F7FFF9]">
            {/* ✅ Header gắn ở trên cùng */}
            <Header onMenuClick={handleMenuClick} />

            {/* Nội dung chính */}
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white/90 rounded-2xl shadow-lg w-full max-w-[420px] p-8">
                    <h2 className="text-2xl font-semibold text-center text-[#38A3A5] mb-6">
                        Đăng ký thông tin xe
                    </h2>

                    {message && (
                        <p
                            className={`text-center text-sm mb-3 ${message.includes("✅") ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {message}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <Car className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
                            <Input
                                name="license_plate"
                                placeholder="Nhập biển số xe"
                                value={form.license_plate}
                                onChange={handleChange}
                                className="pl-10 border-b-2 border-[#57CC99] focus:border-[#38A3A5] bg-transparent rounded-none"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Hash className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
                            <Input
                                name="model"
                                placeholder="Chọn model"
                                value={form.model}
                                onChange={handleChange}
                                className="pl-10 border-b-2 border-[#57CC99] focus:border-[#38A3A5] bg-transparent rounded-none"
                                required
                            />
                        </div>

                        <div className="relative">
                            <KeyRound
                                className="absolute left-3 top-3 text-[#38A3A5]"
                                size={18}
                            />
                            <Input
                                name="vin"
                                placeholder="Nhập số VIN"
                                value={form.vin}
                                onChange={handleChange}
                                className="pl-10 border-b-2 border-[#57CC99] focus:border-[#38A3A5] bg-transparent rounded-none"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white font-semibold mt-4"
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký thông tin xe"}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}
