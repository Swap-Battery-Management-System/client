import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";


export default function RegisterInfo() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[800px] p-6 rounded-2xl shadow-lg bg-white">
                <div className="flex justify-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-[#38A3A5] text-xl">⚡</span>
                        <span className="text-[#38A3A5]">SwapNet</span>
                    </h1>
                </div>

                <h2 className="text-3xl font-bold text-center mb-4 text-green-400">Đăng ký tài khoản</h2>
                <Separator className="mb-4" />

                {/* Grid 2 cột cho từng hàng */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Họ tên / Số điện thoại */}
                    <div>
                        <Label className="mb-2">Họ và tên</Label>
                        <Input placeholder="Nhập họ tên" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>
                    <div>
                        <Label className="mb-2">Số điện thoại</Label>
                        <Input type="tel" placeholder="Nhập số điện thoại" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>

                    {/* Tên đăng nhập / Địa chỉ */}
                    <div>
                        <Label className="mb-2">Tên đăng nhập</Label>
                        <Input placeholder="Nhập tên đăng nhập" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>
                    <div>
                        <Label className="mb-2">Địa chỉ</Label>
                        <Input
                            placeholder="Nhập địa chỉ"
                            className="px-2 py-1.5 border-2 border-emerald-500 rounded-md w-full"
                            maxLength={255}
                        />
                    </div>

                    {/* Mật khẩu / Ngày sinh */}


                    <div>
                        <Label className="mb-2">Ngày sinh</Label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="Ngày"
                                className="flex-1 px-2 border-2 border-emerald-500 rounded-md py-1.5 px-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                            />

                            <input
                                type="number"
                                min="1"
                                max="12"
                                placeholder="Tháng"
                                className="flex-1 px-2 border-2 border-emerald-500 rounded-md py-1.5 px-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                            />
                            <input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                placeholder="Năm"
                                className="flex-1 px-2  border-2 border-emerald-500 rounded-md py-1.5 px-2 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                            />
                        </div>
                    </div>


                    <div className="relative">
                        <Label className="mb-2">Mật khẩu</Label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            className="px-2 py-1.5 border-2 border-emerald-500 rounded-md pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-9 right-2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>



                    {/* Giới tính * /Xác nhận mật khẩu/ */}

                    <div>
                        <Label className="mb-2">Giới tính</Label>
                        <div className="flex items-center gap-4 mt-1">
                            <label className="flex items-center gap-1">
                                <input type="radio" name="gender" value="male" /> Nam
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="gender" value="female" /> Nữ
                            </label>
                        </div>
                    </div>


                    <div className="relative">
                        <Label className="mb-2">Xác nhận mật khẩu</Label>
                        <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu"
                            className="px-2 py-1.5 border-2 border-emerald-500 rounded-md pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute top-9 right-2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>

                    {/* Nút đăng ký */}
                    <div className="col-span-2 flex flex-col items-center mt-6">
                        <Button className="px-2 py-1.5 mt-3 w-1/2 bg-[#57CC99] text-white hover:bg-purple-700">Đăng ký</Button>

                    </div>
                </div>
            </Card>
        </div>
    )
}
