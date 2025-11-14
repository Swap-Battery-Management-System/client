import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";
import { NavLink } from "react-router-dom";
import logo from "/svg.svg";
import { useAuthStore } from "@/stores/authStores";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { setUser } = useAuth();

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(""); // 👈 Thêm state để hiển thị lỗi nhỏ dưới input

  const checkEmail = async (email: string) => {
    try {
      const res = await api.post("/auth/check", { email });

      if (res.status === 204) {
        console.log("✅ Email chưa tồn tại.");
        return false;
      }
      return true;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        console.log("✅ Email chưa tồn tại.");
        return false;
      }
      console.log("❌ Đã xảy ra lỗi khi kiểm tra email:", err);
      return true;
    }
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    setEmailError(""); // reset lỗi cũ

    if (!email) {
      setEmailError("Vui lòng nhập email!");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const exist = await checkEmail(email);
      if (exist) {
        setEmailError("Email đã được sử dụng. Vui lòng thử email khác.");
        setLoading(false);
        return;
      }

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

      const res = await api.post(
        "/auth/google",
        { credential },
        { withCredentials: true, headers: { "skip-auth-refresh": "true" } }
      );

      // Lưu token
      useAuthStore.getState().setAccessToken(res.data.data.accessToken);

      const user = res.data.data.user;
      setUser(user);

      console.log("🟢 Google Register response:", res.data);

      // === CASE 1: TÀI KHOẢN GOOGLE MỚI → status = pending hoặc HTTP 201 ===
      if (res.status === 201 || user.status === "pending") {
        toast.success("Tài khoản Google mới được tạo, vui lòng hoàn tất thông tin!");
        navigate("/register/info");
        return;
      }

      // === CASE 2: TÀI KHOẢN ĐÃ TỒN TẠI → đăng nhập luôn ===
      toast.success("Đăng nhập Google thành công!");

      const role = user.role?.name;
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else navigate("/home"); // driver

    } catch (err: any) {
      console.error("❌ Lỗi khi đăng ký Google:", err);
      toast.error(err.response?.data?.message || "Không thể đăng ký bằng Google!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
      <Card className="w-[420px] rounded-2xl shadow-lg bg-white p-8">
        <NavLink
          to="/"
          className="flex items-center justify-center mb-1"
        >
          <img
            src={logo}
            alt="EV Battery Swap Logo"
            className="h-14 w-auto object-contain hover:opacity-90 transition"
          />
        </NavLink>
        <h2
          className="text-3xl font-extrabold text-center text-[#15b892] 
           mb-3 -mt-1"
        >
          Đăng ký tài khoản
        </h2>



        <label className="text-sm font-sans font-bold mb-[-5px] block"
        >Email: </label>
        <div className="relative mb-0.5 mt-[-15px]">
          <Mail className="absolute left-3 top-2.5 text-[#38A3A5]" size={18} />
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="Nhập email của bạn"
            className={`pl-10 border-2 rounded-md pr-3 ${emailError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-emerald-500 focus-visible:ring-emerald-500"
              }`}
          />

          {/* 👇 Dòng lỗi nằm sát ngay dưới input, căn phải */}
          {emailError && (
            <p className="absolute right-1 bottom-[-18px] text-red-500 text-xs">
              {emailError}
            </p>
          )}
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
