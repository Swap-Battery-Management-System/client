import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async () => {
        if (password !== confirm) return toast.error("Mật khẩu không khớp!");
        try {
            await api.post("/auth/register", { email, password });
            toast.success("Cập nhật mật khẩu thành công!");
            navigate("/register/info");
        } catch {
            toast.error("Lỗi khi tạo tài khoản!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg bg-white">
                <h2 className="text-2xl font-bold text-center text-[#38A3A5] mb-6">
                    Cập nhật mật khẩu
                </h2>

                <div className="relative mb-4">
                    <label className="text-sm font-medium">Mật khẩu mới</label>
                    <Input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        className="mt-1 border-2 border-emerald-500 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute top-8 right-2 text-gray-500"
                    >
                        {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                <div className="relative mb-6">
                    <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                    <Input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="mt-1 border-2 border-emerald-500 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute top-8 right-2 text-gray-500"
                    >
                        {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                <Button
                    className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white py-2"
                    onClick={handleSubmit}
                >
                    Lưu mật khẩu
                </Button>
            </Card>
        </div>
    );
}
