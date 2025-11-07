import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

export default function OtpVerify() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
    const [resending, setResending] = useState(false);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length < 6) return toast.error("Nhập đủ 6 số OTP.");
        try {
            await api.post("/auth/verify-otp", { email, otp: code });
            toast.success("OTP xác thực thành công!");
            localStorage.setItem("pendingEmail", email);
            navigate("/register/password", { state: { email } });
        } catch {
            toast.error("OTP sai hoặc đã hết hạn!");
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await api.post("/auth/send-otp", { email });
            toast.success("OTP mới đã được gửi!");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch {
            toast.error("Không thể gửi lại OTP!");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-[#38A3A5] mb-4">
                    Xác thực OTP
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Nhập mã OTP 6 chữ số được gửi tới email:{" "}
                    <span className="font-medium text-emerald-600">{email}</span>
                </p>

                <div className="flex justify-between mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                        />
                    ))}
                </div>

                <Button
                    className="bg-[#57CC99] hover:bg-[#38A3A5] text-white w-full py-3 mb-3"
                    onClick={handleVerify}
                >
                    Xác thực
                </Button>

                <p
                    className="text-sm text-center text-[#38A3A5] cursor-pointer hover:underline"
                    onClick={handleResend}
                >
                    {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
                </p>
            </Card>
        </div>
    );
}
