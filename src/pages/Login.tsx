import * as React from "react";
import { Mail, Lock, Phone } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "../components/ui/input";
import { GoogleLogin } from "@react-oauth/google";
import { useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useNavigate } from "react-router-dom";


interface FormData {
  phone: string;
  identifier: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<FormData>({
    phone: "",
    identifier: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("success");
  const { setUser } = useAuth();
  const [usePhoneLogin, setUsePhoneLogin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMethod, setResetMethod] = useState<"email" | "phone" | null>(
    null
  );


  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

  const {success, error}=useNotification();

  useEffect(() => {
    if (!message) return;

    if (type === "success") {
      success({message:message });
    } else {
      error({message:message});
    }

   setTimeout(() => setMessage(""), 2000);
  }, [message, type]);

  // Hàm redirect theo role
  const redirectByRole = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "staff":
        navigate("/moderator");
        break;
      case "driver":
        navigate("/home");
    }
  };

  const errorMessages: Record<number, string> = {
    400: "⚠️ Dữ liệu nhập không hợp lệ.",
    409: "⚠️ Email hoặc username đã tồn tại.",
    500: "⚠️ Lỗi server, vui lòng thử lại sau.",
    401: "❌ Email hoặc mật khẩu không đúng.",
  };

  const sucessMessage: Record<number, string> = {
    200: "Đăng nhập thành công!",
    201: "Tài khoản mới được tạo tự động!",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isEmail = (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const payload = usePhoneLogin
      ? { phone: form.phone, password: form.password }
      : isEmail(form.identifier)
      ? { email: form.identifier.trim(), password: form.password }
      : { username: form.identifier.trim(), password: form.password };

    console.log(payload);
    try {
      const res = await api.post("/auth/login", payload, {
        withCredentials: true,
      });
      const user = res.data.data.user;
      console.log(user);
      setUser(user);
      
      setType("success");
      setMessage("Đăng nhập thành công!");

      setTimeout(()=>{
        redirectByRole(user.role);
      },3000)
      ; // redirect theo role
    } catch (err: any) {
      setType("error");
      if (err.response) {
        setMessage(
          errorMessages[err.response.status] || "⚠️ Lỗi không xác định."
        );
      } else {
        // Không có phản hồi từ server (network error)
        setMessage("⚠️ Không thể kết nối đến máy chủ.");
        setType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Google Login
  // ========================
  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;
      console.log(credential);
      if (!credential) return;

      const res = await api.post(
        `/auth/google`,
        { credential },
        { withCredentials: true }
      );
      const user = res.data.data.user;
      console.log("gg:",res.data);

      setUser(user);
      setType("success");
      setMessage(
       sucessMessage[res.status]
      );
      setTimeout(() => {
        redirectByRole(user.role);
      }, 3000); // redirect theo role
    } catch (err:any) {
      setType("error");
      if (err.response) {
        setMessage(
          errorMessages[err.response.status] || "⚠️ Lỗi không xác định."
        );
      } else {
        // Không có phản hồi từ server (network error)
        setMessage("⚠️ Không thể kết nối đến máy chủ.");
        setType("error");
      }
    }
  };

  const handleGoogleError = () => {
    setMessage("⚠️ Đăng nhập Google bị hủy hoặc thất bại.");
    setType("error");
  };

  // ========================
  // 🔹 Forgot Password flow
  // ========================
  const handleSendOtp = async () => {
    try {
      const payload =
        resetMethod === "email"
          ? { email: form.identifier }
          : { phone: form.phone };
      await api.post(`/auth/send-otp`, payload);
      setOtpSent(true);
    } catch {
      alert("Không gửi được OTP, thử lại sau.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await api.post(`/auth/verify-otp`, { otp });
      alert("✅ Xác thực OTP thành công. Nhập mật khẩu mới!");
    } catch {
      alert("❌ Mã OTP không đúng!");
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/auth/reset-password`, {
        identifier: resetMethod === "email" ? form.identifier : form.phone,
        newPassword,
      });
      alert("✅ Đặt lại mật khẩu thành công!");
      setShowForgot(false);
    } catch {
      alert("❌ Không thể đặt lại mật khẩu, thử lại sau!");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
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

          {/* Form login */}
          <form onSubmit={handleLogin} className="mt-6 space-y-5 text-left">
            {[
              usePhoneLogin
                ? {
                    label: "Số điện thoại",
                    name: "phone",
                    type: "tel",
                    placeholder: "Nhập số điện thoại của bạn",
                    icon: (
                      <Phone
                        className="absolute left-3 top-3 text-[#38A3A5]"
                        size={18}
                      />
                    ),
                  }
                : {
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
                    type={field.type}
                    placeholder={field.placeholder}
                    className="pl-10 border-0 border-b-2 border-[#57CC99] focus:border-[#38A3A5] rounded-none bg-transparent"
                    required
                  />
                </div>
                {field.name === "password" && (
                  <p
                    className="text-right text-sm mt-1 text-[#38A3A5] hover:underline cursor-pointer"
                    onClick={() => setShowForgot(true)}
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
                    {["email", "phone"].map((method) => (
                      <Button
                        key={method}
                        onClick={() => {
                          setResetMethod(method as "phone" | "email");
                          handleSendOtp();
                        }}
                        className="flex-1 bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                      >
                        {method === "email" ? "Email" : "Số điện thoại"}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <label className="text-sm text-gray-500 mt-2">
                    Nhập mã OTP
                  </label>
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

                  <label className="text-sm text-gray-500 mt-3">
                    Mật khẩu mới
                  </label>
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
    </>
  );
}
