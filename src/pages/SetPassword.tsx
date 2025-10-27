import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isStrongPassword = (password: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

    const handleSubmit = async () => {
        if (!isStrongPassword(password))
            return toast.error("Mật khẩu phải có ít nhất 8 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt!");
        if (password !== confirm)
            return toast.error("Mật khẩu và xác nhận không khớp!");

        setLoading(true);
        try {
            const res = await api.post("/auth/register", { email, password });
            console.log("✅ Register response:", res.data);

            const user = res.data?.data?.user;
            if (!user || !user.id) {
                toast.error("Không nhận được ID người dùng từ backend!");
                return;
            }

            localStorage.setItem("pendingEmail", email);
            localStorage.setItem("pendingUserId", user.id);

            toast.success("Tạo tài khoản thành công! Vui lòng nhập thông tin cá nhân.");
            navigate("/register/info", { state: { email, userId: user.id } });
        } catch (err: any) {
            console.error("Register error:", err);
            toast.error(err.response?.data?.message || "Không thể tạo tài khoản!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[420px] rounded-2xl shadow-lg bg-white p-8">
                <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-4">
                    Tạo mật khẩu
                </h2>

                <div className="space-y-4">
                    {/* Nhập mật khẩu */}
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="border-2 border-emerald-500 rounded-md pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="relative">
                        <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Xác nhận mật khẩu"
                            className="border-2 border-emerald-500 rounded-md pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
                        <li>Tối thiểu 8 ký tự</li>
                        <li>Ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt</li>
                    </ul>

                    <Button
                        className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white mt-2"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Đang xử lý..." : "Tiếp tục"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
