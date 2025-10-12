import { useNavigate } from "react-router-dom";
import { Mail, Lock, Phone, Zap } from "lucide-react"; // ⚡ dùng Zap thay cho ShieldCheck
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
<<<<<<< HEAD
        navigate("/home"); // 👉 chuyển sang trang chính sau khi đăng nhập
=======
        navigate("/trang-chu"); // 👉 chuyển sang trang chính sau khi đăng nhập
>>>>>>> feature/booking-page
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-[#11998E] to-[#38EF7D] relative overflow-hidden"
        >
            {/* Hình tròn nền trang trí */}
            <div className="absolute w-40 h-40 bg-white/10 rounded-full top-10 left-20 blur-3xl"></div>
            <div className="absolute w-52 h-52 bg-white/10 rounded-full bottom-20 right-20 blur-2xl"></div>

            {/* Card Login */}
            <div className="relative z-10 w-[380px] md:w-[420px] bg-white shadow-xl rounded-3xl px-8 py-10 flex flex-col items-center">
                {/* Logo + tên SwapNet */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-[#38A3A5]/10 rounded-full">
                        <Zap className="text-[#38A3A5] size-6" /> {/* ⚡ icon tia sét */}
                    </div>
                    <h1 className="text-[#2F3E46] font-bold text-xl">SwapNet</h1>
                </div>

                {/* Tiêu đề */}
                <h2 className="text-[#2F3E46] text-2xl font-semibold mb-1 text-center">
                    Welcome back
                </h2>
                <p className="text-[#52796F] text-sm mb-8 text-center">
                    Đăng nhập để tiếp tục với SwapNet
                </p>

                {/* Form */}
                <form onSubmit={handleLogin} className="w-full space-y-5">
                    {/* Username or Email */}
                    <div>
                        <label className="block text-sm text-[#2F3E46]/80 mb-1">
                            Username or Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#48B89F] size-5" />
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập hoặc email"
                                className={cn(
                                    "w-full pl-10 pr-3 py-2 border-b-2 border-[#80ED99] focus:border-[#57CC99]",
                                    "text-[#2F3E46] placeholder:text-[#326F6D]/50 bg-transparent outline-none"
                                )}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm text-[#2F3E46]/80 mb-1">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#48B89F] size-5" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className={cn(
                                    "w-full pl-10 pr-3 py-2 border-b-2 border-[#80ED99] focus:border-[#57CC99]",
                                    "text-[#2F3E46] placeholder:text-[#326F6D]/50 bg-transparent outline-none"
                                )}
                            />
                        </div>
                    </div>

                    {/* Quên mật khẩu */}
                    <div className="text-right">
                        <a href="#" className="text-[#48B89F] text-sm hover:underline">
                            Quên mật khẩu?
                        </a>
                    </div>

                    {/* Nút đăng nhập */}
                    <Button
                        type="submit"
                        className="w-full bg-[#57CC99] hover:bg-[#48B89F] text-white font-semibold mt-2 py-2"
                    >
                        Đăng nhập
                    </Button>

                    {/* Đăng nhập khác */}
                    <div className="flex flex-col gap-3 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-[#57CC99] text-[#2F3E46] hover:bg-[#E6FFF4]"
                        >
                            <Phone className="size-5 mr-2 text-[#48B89F]" />
                            Đăng nhập bằng số điện thoại
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-[#DB4437] text-[#2F3E46] hover:bg-[#FEE]"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                className="size-5 mr-2"
                            />
                            Đăng nhập bằng Google
                        </Button>
                    </div>

                    {/* Đăng ký */}
                    <p className="text-center text-sm text-[#2F3E46]/80 mt-5">
                        Chưa có tài khoản?{" "}
                        <span
<<<<<<< HEAD
                            onClick={() => navigate("/signup")}
=======
                            onClick={() => navigate("/dang-ki")}
>>>>>>> feature/booking-page
                            className="text-[#38A3A5] hover:underline cursor-pointer font-medium"
                        >
                            Đăng ký ngay
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}
