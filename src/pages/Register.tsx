
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
      <Card className="w-2/3 h-1/3 grid grid-cols-2 rounded-2xl shadow-lg bg-white p-6">
        {/* BÊN TRÁI */}
        <div className="flex flex-col justify-center items-center border-r pr-6">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <span className="text-[#38A3A5] text-xl">⚡</span>
            <span className="text-[#38A3A5]">SwapNet</span>
          </h1>
          <p className="mt-2 text-lg font-semibold text-gray-600">
            Tạo tài khoản
          </p>
        </div>

        {/* BÊN PHẢI */}
        <div className="flex flex-col justify-center pl-6 h-full">
          <label className="mb-2 mt-12 font-medium">Email</label>
          <Input
            type="email"
            placeholder="Nhập email của bạn"
            className="w-full border-2 border-emerald-500 rounded-md px-3 py-2 flex-1"
          />
          <div className="flex justify-end">
            <Button
              className="bg-[#57CC99] hover:bg-purple-700 text-white w-1/3 py-2 mt-4"
              onClick={() => navigate("/register/verify")}
            >
              Tiếp tục
            </Button>
          </div>
          <p className="text-center text-sm mt-6">
            Đã có tài khoản?{" "}
            <span
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </span>
          </p>
        </div>
      </Card>

    </div>
  );
}
