import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email!");
    if (!validateEmail(email)) return toast.error("Email không hợp lệ!");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      toast.success("OTP đã được gửi tới email của bạn!");
      navigate("/register/verify", { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) return;
      const res = await api.post("/auth/google", { credential });
      toast.success(res.data.message || "Đăng ký / đăng nhập Google thành công!");
      navigate("/register/info");
    } catch {
      toast.error("Đăng ký bằng Google thất bại!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
      <Card className="w-[420px] rounded-2xl shadow-lg bg-white p-8">
        <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-6">
          Đăng ký tài khoản
        </h2>

        <label className="text-sm font-medium">Email</label>
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="pl-10 border-2 border-emerald-500 rounded-md"
          />
        </div>

        <Button
          className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
          disabled={loading}
          onClick={handleSendOtp}
        >
          {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
        </Button>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => toast.error("Đăng ký bằng Google thất bại!")}
            theme="outline"
            text="signup_with"
            width="350"
          />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#38A3A5] font-medium cursor-pointer hover:underline"
          >
            Đăng nhập
          </span>
        </p>
      </Card>
    </div>
  );
}
