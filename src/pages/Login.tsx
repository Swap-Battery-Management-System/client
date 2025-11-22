import * as React from "react";
import { Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "../components/ui/input";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";
import logo from "/svg.svg";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStores";
interface FormData {
  identifier: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<FormData>({
    identifier: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("success");
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!message) return;

    if (type === "success") toast.success(message, { duration: 1000 });
    else toast.error(message, { duration: 1000 });
  }, [message, type]);

  const redirectByRole = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "staff":
        navigate("/staff");
        break;
      case "driver":
        navigate("/home");
        break;
    }
  };

  const errorMessages: Record<number, string> = {
    400: "⚠️ Dữ liệu nhập không hợp lệ.",
    409: "⚠️ Email hoặc username đã tồn tại.",
    500: "⚠️ Lỗi server, vui lòng thử lại sau.",
    401: "❌ Email hoặc mật khẩu không đúng.",
  };

  const successMessage: Record<number, string> = {
    200: "Đăng nhập thành công!",
    201: "Tài khoản mới được tạo tự động!",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isEmail = (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const payload = isEmail(form.identifier)
      ? { email: form.identifier.trim(), password: form.password }
      : { username: form.identifier.trim(), password: form.password };

    try {
      const res = await api.post("/auth/login", payload, {
        withCredentials: true,
        headers: { "skip-auth-refresh": "true" },
      });
      useAuthStore.getState().setAccessToken(res.data.data.accessToken);
      const userData = await api.get("auth/me", { withCredentials: true });

      const user = userData.data.data.user;
      console.log("login", userData.data);
      setUser(user);

      setType("success");
      setMessage("Đăng nhập thành công!");
      console.log(user.role.name);
      setTimeout(() => redirectByRole(user.role.name), 2000);
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      setType("error");
      if (err.response) {
        setMessage(
          errorMessages[err.response.status] || "⚠️ Lỗi không xác định."
        );
      } else {
        setMessage("⚠️ Không thể kết nối đến máy chủ.");
      }
    } finally {
      console.log("finally");
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) return;

      const res = await api.post(
        `/auth/google`,
        { credential },
        { withCredentials: true, headers: { "skip-auth-refresh": "true" } }
      );
      useAuthStore.getState().setAccessToken(res.data.data.accessToken);
      const user = res.data.data.user;
      console.log("gg:", user);

      setUser(user);

      setType("success");
      setMessage(successMessage[res.status]);
      console.log("role", user.role);
      if (user.status === "active") {
        setTimeout(() => redirectByRole(user.role.name), 2000);
      } else if (user.status === "pending") {
        setTimeout(() =>navigate("/register/info"), 2000);
      }
    } catch (err: any) {
      setType("error");
      if (err.response) {
        setMessage(
          errorMessages[err.response.status] || "⚠️ Lỗi không xác định."
        );
      } else {
        setMessage("⚠️ Không thể kết nối đến máy chủ.");
      }
    }
  };

  const handleGoogleError = () => {
    setMessage("⚠️ Đăng nhập Google bị hủy hoặc thất bại.");
    setType("error");
  };

  const handleResetPassword = (e: React.MouseEvent) => {
    e.preventDefault;
    navigate("/login/reset-password");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#38A3A5] via-[#57CC99] to-[#C7F9CC] relative overflow-hidden">
      <div className="absolute w-40 h-40 bg-white/20 rounded-full top-10 left-20 blur-3xl"></div>
      <div className="absolute w-52 h-52 bg-white/10 rounded-full bottom-20 right-20 blur-2xl"></div>

      <div className="relative z-10 w-[380px] md:w-[420px] bg-white/90 rounded-2xl shadow-lg p-8 text-center">
        <NavLink to="/" className="flex items-center gap-2 ml-1 justify-center">
          <img
            src={logo}
            alt="EV Battery Swap Logo"
            className="h-14 w-auto object-contain hover:opacity-90 transition"
          />
        </NavLink>

        <p className="mt-2 text-gray-600">Đăng nhập để tiếp tục với SwapNet</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-5 text-left">
          {[
            {
              label: "Email hoặc Tên đăng nhập",
              name: "identifier",
              type: "text",
              placeholder: "Nhập email hoặc tên đăng nhập",
              icon: (
                <Mail
                  className="absolute left-3 top-3 text-[#38A3A5]"
                  size={18}
                />
              ),
            },
            {
              label: "Mật khẩu",
              name: "password",
              type: "password",
              placeholder: "••••••••",
              autocomplete: "current-password",
              icon: (
                <Lock
                  className="absolute left-3 top-3 text-[#38A3A5]"
                  size={18}
                />
              ),
            },
          ].map((field, idx) => (
            <div key={idx}>
              <label className="text-sm text-gray-500">{field.label}</label>
              <div className="relative mt-1">
                {field.icon}
                <Input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  type={
                    field.name === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : field.type
                  }
                  placeholder={field.placeholder}
                  className="pl-10 pr-10 border-0 border-b-2 border-[#57CC99] focus:border-[#38A3A5] rounded-none bg-transparent"
                  required
                />

                {/* nút con mắt chỉ xuất hiện cho trường password */}
                {field.name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>

              {field.name === "password" && (
                <p
                  className="text-right text-sm mt-1 text-[#38A3A5] hover:underline cursor-pointer"
                  onClick={handleResetPassword}
                >
                  Quên mật khẩu?
                </p>
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white font-semibold"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <span className="px-2 text-gray-400 text-sm">Hoặc</span>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          <div className="mt-3 w-full flex justify-center">
            <div className="w-full max-w-[380px]">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                theme="outline"
                shape="rectangular"
                text="signin_with"
                width="350"
              />
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-[#38A3A5] font-medium hover:underline"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
