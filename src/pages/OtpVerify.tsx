import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function OtpVerify() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; // chỉ cho phép số
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // focus ô tiếp theo
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerify = () => {
        const enteredOtp = otp.join("");
        console.log("OTP nhập:", enteredOtp);
        navigate("/register/info");
    };

    const handleResend = () => {
        console.log("Gửi lại OTP");
        alert("OTP mới đã được gửi tới email của bạn!");
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-[#38A3A5] mb-4">
                    Xác thực OTP
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Nhập mã OTP 6 chữ số được gửi tới email của bạn
                </p>

                {/* Ô nhập OTP */}
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

                {/* Nút xác thực */}
                <Button
                    className="bg-[#57CC99] hover:bg-[#38A3A5] text-white w-full py-3 mb-4"
                    onClick={handleVerify}
                >
                    Xác thực
                </Button>

                {/* Gửi lại OTP */}
                <p className="text-center text-sm text-gray-500">
                    Chưa nhận được OTP?{" "}
                    <span
                        className="text-[#38A3A5] font-semibold cursor-pointer hover:underline"
                        onClick={handleResend}
                    >
                        Gửi lại
                    </span>
                </p>
            </Card>
        </div>
    );
}
