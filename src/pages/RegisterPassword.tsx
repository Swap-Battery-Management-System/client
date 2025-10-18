import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function RegisterPassword() {
    const { state } = useLocation();
    const email = state?.email;
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (password !== confirm) return toast.error("Mật khẩu không khớp!");
        setLoading(true);
        try {
            await api.post("/auth/register", { email, password }, { withCredentials: true });
            toast.success("Tạo mật khẩu thành công!");
            navigate("/register/info");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Lỗi khi tạo mật khẩu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[380px] p-8 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-[#38A3A5] mb-6">
                    Tạo mật khẩu
                </h2>
                <div className="relative mb-4">
                    <Input
                        type={showPass ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-2 border-emerald-500 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute top-2.5 right-2 text-gray-500"
                    >
                        {showPass ? <Eye /> : <EyeOff />}
                    </button>
                </div>
                <div className="relative mb-6">
                    <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="border-2 border-emerald-500 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute top-2.5 right-2 text-gray-500"
                    >
                        {showConfirm ? <Eye /> : <EyeOff />}
                    </button>
                </div>
                <Button
                    className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? "Đang lưu..." : "Tiếp tục"}
                </Button>
            </Card>
        </div>
    );
}
