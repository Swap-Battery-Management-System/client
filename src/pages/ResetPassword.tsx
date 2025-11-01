import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, CheckCircle, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // lưu token từ /revoke



  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
    return regex.test(password);
  };

  // STEP 1: Gửi OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email!");

    setLoading(true);
    try {
      // Kiểm tra email có tồn tại không
      const checkRes = await api.post("/auth/check", { email });
      if (checkRes.status === 404) {
        toast.error("Email này chưa được đăng ký!");
        return;
      }

      // Nếu tồn tại thì gửi OTP
      await api.post("/auth/send-otp", { email });
      toast.success("OTP đã được gửi tới email của bạn!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP. Thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Xác thực OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return toast.error("Nhập đủ 6 số OTP!");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });

      // Thu hồi refresh token & nhận reset token
      const res = await api.post("/auth/revoke", { email });
      const token = res.data?.data?.resetToken;

      if (!token) return toast.error("Không nhận được resetToken từ server!");

      console.log("Reset token từ API:", token);
      setResetToken(token);

      toast.success(" OTP xác thực thành công!");
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP sai hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset password
  const handleResetPassword = async () => {
    if (newPass !== confirm)
      return toast.error("Mật khẩu và xác nhận không khớp!");
    if (!resetToken) return toast.error("Không có reset token. Thử lại OTP.");
    setLoading(true);
    try {
      await api.post("/auth/reset-pass", { resetToken, newPass });
      toast.success(" Đặt lại mật khẩu thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "❌ Lỗi khi đặt lại mật khẩu!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
      <Card className="w-[420px] rounded-2xl shadow-lg bg-white p-8">
        <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-4">
          Đặt lại mật khẩu
        </h2>

        {/* STEP 1: Nhập email */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-[#38A3A5]"
                size={18}
              />
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

        {/* STEP 3: Đặt mật khẩu mới */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Mật khẩu mới</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-[#38A3A5]"
                size={18}
              />
              <Input
                type={showNewPass ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 border-2 border-emerald-500 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {newPass && !validatePassword(newPass) && (
              <p className="text-red-500 text-sm mt-1">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường,
                số và ký tự đặc biệt.
              </p>
            )}

            {/* Xác nhận mật khẩu */}
            <label className="text-sm font-medium">Xác nhận mật khẩu</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="pr-10 border-2 border-emerald-500 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
              disabled={loading}
              onClick={handleResetPassword}
            >
              {loading ? "Đang đặt lại mật khẩu..." : "Hoàn tất"}
            </Button>

            <div className="mt-4 text-center text-green-600 flex items-center justify-center gap-1">
              <CheckCircle size={18} />
              <span>Email {email} đã được xác thực</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
