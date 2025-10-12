import * as React from "react";
import axios from "axios";
import { Mail, Lock, Phone } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
    const [usePhoneLogin, setUsePhoneLogin] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [form, setForm] = React.useState({
        usernameOrEmail: "",
        password: "",
        phone: "",
    });

    const [showForgot, setShowForgot] = React.useState(false);
    const [otpSent, setOtpSent] = React.useState(false);
    const [otp, setOtp] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [resetMethod, setResetMethod] = React.useState<"email" | "phone" | null>(
        null
    );

    const navigate = useNavigate();

    // ========================
    // 🔹 Handle input changes
    // ========================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ========================
    // 🔹 Handle login (Email / Phone)
    // ========================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const payload = usePhoneLogin
                ? { phone: form.phone, password: form.password }
                : {
                    username: form.usernameOrEmail,
                    email: form.usernameOrEmail,
                    password: form.password,
                };

            const res = await axios.post(`${API_URL}/auth/login`, payload);
            const data = res.data;

            if (data.authenticated) {
                setMessage("✅ Đăng nhập thành công!");
                localStorage.setItem("user", JSON.stringify(data.user));
                setTimeout(() => navigate("/trang-chu"), 1000);
            } else {
                setMessage("❌ Tài khoản hoặc mật khẩu không đúng.");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi hệ thống, thử lại sau.";
            if (msg.includes("not found")) setMessage("❌ Tài khoản không tồn tại.");
            else if (msg.includes("password")) setMessage("❌ Mật khẩu không đúng.");
            else setMessage(`⚠️ ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // ========================
    // 🔹 Google Login
    // ========================
    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const token = credentialResponse.credential;
            if (!token) return;

            const res = await axios.post(`${API_URL}/auth/google`, { token });
            const data = res.data;

            localStorage.setItem("user", JSON.stringify(data.user));
            setMessage(
                data.authenticated
                    ? "✅ Đăng nhập Google thành công!"
                    : "🆕 Tài khoản mới được tạo tự động!"
            );
            setTimeout(() => navigate("/trang-chu"), 1000);
        } catch (err) {
            console.error(err);
            setMessage("⚠️ Đăng nhập Google thất bại, vui lòng thử lại.");
        }
    };

    const handleGoogleError = () => {
        setMessage("⚠️ Đăng nhập Google bị hủy hoặc thất bại.");
    };

    // ========================
    // 🔹 Forgot Password flow
    // ========================
    const handleSendOtp = async () => {
        try {
            const payload =
                resetMethod === "email"
                    ? { email: form.usernameOrEmail }
                    : { phone: form.phone };
            await axios.post(`${API_URL}/auth/send-otp`, payload);
            setOtpSent(true);
        } catch {
            alert("Không gửi được OTP, thử lại sau.");
        }
    };

    const handleVerifyOtp = async () => {
        try {
            await axios.post(`${API_URL}/auth/verify-otp`, { otp });
            alert("✅ Xác thực OTP thành công. Nhập mật khẩu mới!");
        } catch {
            alert("❌ Mã OTP không đúng!");
        }
    };

    const handleResetPassword = async () => {
        try {
            await axios.post(`${API_URL}/auth/reset-password`, {
                identifier:
                    resetMethod === "email" ? form.usernameOrEmail : form.phone,
                newPassword,
            });
            alert("✅ Đặt lại mật khẩu thành công!");
            setShowForgot(false);
        } catch {
            alert("❌ Không thể đặt lại mật khẩu, thử lại sau!");
        }
    };

    // ========================
    // 🔹 UI
    // ========================
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#38A3A5] via-[#57CC99] to-[#C7F9CC] relative overflow-hidden">
            {/* Nền trang trí */}
            <div className="absolute w-40 h-40 bg-white/20 rounded-full top-10 left-20 blur-3xl"></div>
            <div className="absolute w-52 h-52 bg-white/10 rounded-full bottom-20 right-20 blur-2xl"></div>

            {/* Card Login */}
            <div className="relative z-10 w-[380px] md:w-[420px] bg-white/90 rounded-2xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-semibold text-[#38A3A5]">SwapNet</h2>
                <p className="mt-2 text-gray-600">
                    {usePhoneLogin
                        ? "Đăng nhập bằng số điện thoại"
                        : "Đăng nhập để tiếp tục với SwapNet"}
                </p>

                {/* Thông báo */}
                {message && (
                    <div
                        className={`mt-3 text-sm font-medium ${message.includes("✅")
                            ? "text-green-600"
                            : message.includes("⚠️")
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Form login */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-left">
                    {usePhoneLogin ? (
                        <>
                            {/* Số điện thoại */}
                            <div>
                                <label className="text-sm text-gray-500">Số điện thoại</label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
                                    <Input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        placeholder="Nhập số điện thoại của bạn"
                                        className="pl-10 border-0 border-b-2 border-[#57CC99] focus:border-[#38A3A5] rounded-none bg-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm text-gray-500">Mật khẩu</label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
                                    <Input
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 border-0 border-b-2 border-[#57CC99] focus:border-[#38A3A5] rounded-none bg-transparent"
                                        required
                                    />
                                </div>
                                <p
                                    className="text-right text-sm mt-1 text-[#38A3A5] hover:underline cursor-pointer"
                                    onClick={() => setShowForgot(true)}
                                >
                                    Quên mật khẩu?
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Email / Username */}
                            <div>
                                <label className="text-sm text-gray-500">Email hoặc Tên đăng nhập</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
                                    <Input
                                        name="usernameOrEmail"
                                        value={form.usernameOrEmail}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Nhập email hoặc tên đăng nhập"
                                        className="pl-10 border-0 border-b-2 border-[#57CC99] focus:border-[#38A3A5] rounded-none bg-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm text-gray-500">Mật khẩu</label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
                                    <Input
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 border-0 border-b-2 border-[#57CC99] focus:border-[#38A3A5] rounded-none bg-transparent"
                                        required
                                    />
                                </div>
                                <p
                                    className="text-right text-sm mt-1 text-[#38A3A5] hover:underline cursor-pointer"
                                    onClick={() => setShowForgot(true)}
                                >
                                    Quên mật khẩu?
                                </p>
                            </div>
                        </>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white font-semibold"
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                </form>

                {/* Toggle login method */}
                <Button
                    variant="outline"
                    onClick={() => setUsePhoneLogin(!usePhoneLogin)}
                    className="w-full mt-4 border-[#57CC99] text-[#38A3A5] hover:bg-[#E8FFF3]"
                >
                    {usePhoneLogin ? (
                        <>
                            <Mail className="w-5 h-5 mr-2 text-[#38A3A5]" />
                            Đăng nhập bằng Email
                        </>
                    ) : (
                        <>
                            <Phone className="w-5 h-5 mr-2 text-[#38A3A5]" />
                            Đăng nhập bằng Số điện thoại
                        </>
                    )}
                </Button>

                {/* Google Login */}
                <div className="mt-3 w-full flex justify-center">
                    <div className="w-full max-w-[380px]">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={handleGoogleError}
                            theme="outline"
                            shape="rectangular"
                            text="signin_with"
                            width="380"
                        />
                    </div>
                </div>

                {/* Register link */}
                <p className="mt-6 text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <a
                        href="/dang-ky"
                        className="text-[#38A3A5] font-medium hover:underline"
                    >
                        Đăng ký ngay
                    </a>
                </p>
            </div>

            {/* Popup Forgot Password */}
            {showForgot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px]">
                        <h3 className="text-lg font-semibold text-[#38A3A5] mb-4">
                            Quên mật khẩu
                        </h3>

                        {!otpSent ? (
                            <>
                                <p className="text-sm text-gray-600 mb-3">
                                    Chọn phương thức để nhận mã OTP:
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            setResetMethod("email");
                                            handleSendOtp();
                                        }}
                                        className="flex-1 bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                                    >
                                        Email
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setResetMethod("phone");
                                            handleSendOtp();
                                        }}
                                        className="flex-1 bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                                    >
                                        Số điện thoại
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="text-sm text-gray-500 mt-2">Nhập mã OTP</label>
                                <Input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="mt-1 border-b-2 border-[#57CC99] focus:border-[#38A3A5]"
                                />
                                <Button
                                    onClick={handleVerifyOtp}
                                    className="mt-3 w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                                >
                                    Xác thực OTP
                                </Button>

                                <label className="text-sm text-gray-500 mt-3">Mật khẩu mới</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 border-b-2 border-[#57CC99] focus:border-[#38A3A5]"
                                />
                                <Button
                                    onClick={handleResetPassword}
                                    className="mt-3 w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                                >
                                    Đặt lại mật khẩu
                                </Button>
                            </>
                        )}

                        <Button
                            variant="outline"
                            className="mt-4 w-full border-gray-300"
                            onClick={() => setShowForgot(false)}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
