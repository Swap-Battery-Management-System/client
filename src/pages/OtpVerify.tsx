import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

export default function OtpVerify() {
    const location = useLocation();
    const email = location.state?.email;
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length < 6) return toast.error("Nhập đủ 6 số OTP!");
        setLoading(true);
        try {
            await api.post("/auth/verify-otp", { email, otp: code });
            toast.success("OTP xác thực thành công!");
            navigate("/register/password", { state: { email } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "OTP không hợp lệ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-[380px] p-8 rounded-2xl shadow-lg bg-white">
                <h1 className="text-2xl font-bold text-center text-[#38A3A5] mb-4">
                    Xác thực OTP
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Nhập mã 6 số được gửi tới email {email}
                </p>

                <div className="flex justify-between mb-6">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => {
                                inputRefs.current[i] = el;
                            }}
                            onChange={(e) => handleChange(i, e.target.value)}
                            className="w-10 h-10 text-center text-lg border-2 border-gray-300 rounded-md focus:border-emerald-500"
                        />
                    ))}
                </div>

                <Button
                    className="w-full bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                    disabled={loading}
                    onClick={handleVerify}
                >
                    {loading ? "Đang xác thực..." : "Xác nhận"}
                </Button>
            </Card>
        </div>
    );
}
