import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Chrome } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email!");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      toast.success("OTP đã được gửi đến email của bạn!");
      navigate("/register/verify", { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      const res = await api.post("/auth/google", { credential }, { withCredentials: true });
      toast.success("Đăng ký bằng Google thành công!");
      navigate("/register/info");
    } catch {
      toast.error("Đăng ký Google thất bại!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
      <Card className="w-[420px] rounded-2xl shadow-lg bg-white p-8">
        <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-4">
          Đăng ký tài khoản
        </h2>

        <label className="text-sm font-medium">Email</label>
        <div className="relative mt-1 mb-4">
          <Mail className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
          <Input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 border-2 border-emerald-500"
          />
        </div>

        <Button
          className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
          disabled={loading}
          onClick={handleSendOtp}
        >
          {loading ? "Đang gửi..." : "Gửi mã OTP"}
        </Button>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => toast.error("Đăng ký Google thất bại!")}
          />
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#38A3A5] hover:underline cursor-pointer"
          >
            Đăng nhập
          </span>
        </p>
      </Card>
    </div>
  );
}
