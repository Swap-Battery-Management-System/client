import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Chrome, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email!");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      toast.success("OTP đã được gửi tới email của bạn!");
      setStep(2);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return toast.error("Nhập đủ 6 số OTP!");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      toast.success("✅ OTP xác thực thành công!");
      setStep(3);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "❌ OTP sai hoặc đã hết hạn!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký tài khoản
  const handleRegister = async () => {
    if (password !== confirm)
      return toast.error("Mật khẩu và xác nhận không khớp!");
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      toast.success("🎉 Tạo tài khoản thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "❌ Lỗi khi tạo tài khoản!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký bằng Google
  const handleGoogleRegister = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) return;
      const res = await api.post("/auth/google", { credential }, { withCredentials: true });
      toast.success(res.data.message || "Đăng ký / đăng nhập Google thành công!");
      navigate("/register/info");
    } catch (err: any) {
      toast.error("❌ Đăng ký bằng Google thất bại.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
      <Card className="w-[420px] rounded-2xl shadow-lg bg-white p-8">
        <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-4">
          Đăng ký tài khoản
        </h2>

        {/* STEP 1: Nhập email */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
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
          </div>
        )}

        {/* STEP 2: Xác thực OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Nhập mã OTP</label>
            <div className="relative">
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP gồm 6 số"
                className="text-center text-lg tracking-[6px] border-2 border-emerald-500"
              />
            </div>
            <Button
              className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
              disabled={loading}
              onClick={handleVerifyOtp}
            >
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </Button>
            <p
              className="text-sm text-center text-[#38A3A5] cursor-pointer hover:underline"
              onClick={handleSendOtp}
            >
              Gửi lại OTP
            </p>
          </div>
        )}

        {/* STEP 3: Đặt mật khẩu */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#38A3A5]" size={18} />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 border-2 border-emerald-500 rounded-md"
              />
            </div>

            <label className="text-sm font-medium">Xác nhận mật khẩu</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="border-2 border-emerald-500 rounded-md"
            />

            <Button
              className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
              disabled={loading}
              onClick={handleRegister}
            >
              {loading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => toast.error("Đăng ký bằng Google thất bại!")}
            theme="outline"
            shape="rectangular"
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

        {step === 3 && (
          <div className="mt-4 text-center text-green-600 flex items-center justify-center gap-1">
            <CheckCircle size={18} />
            <span>Email {email} đã được xác thực</span>
          </div>
        )}
      </Card>
    </div>
  );
}
