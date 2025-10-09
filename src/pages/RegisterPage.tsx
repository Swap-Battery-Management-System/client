import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function RegisterPage() {
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
                        <Input placeholder="Nhập địa chỉ" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>

                    {/* Giới tính / Ngày sinh */}
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

                    {/* Email / Mật khẩu */}
                    <div>
                        <Label className="mb-2">Email</Label>
                        <Input type="email" placeholder="example@gmail.com" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>
                    <div>
                        <Label className="mb-2">Mật khẩu</Label>
                        <Input type="password" placeholder="Nhập mật khẩu" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>

                    {/* OTP / Nhập lại mật khẩu */}
                    <div>
                        <Label className="mb-2">Xác thực OTP</Label>
                        <Input placeholder="Nhập OTP" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                        <button className="text-sm text-blue-500 mt-1 hover:underline">Resend OTP</button>
                    </div>
                    <div>
                        <Label className="mb-2">Xác nhận mật khẩu</Label>
                        <Input type="password" placeholder="Nhập lại mật khẩu" className="px-2 py-1.5 border-2 border-emerald-500 rounded-md" />
                    </div>

                    {/* Nút đăng ký */}
                    <div className="col-span-2 flex flex-col items-center mt-6">
                        <Button className="px-2 py-1.5 mt-3 w-1/2 bg-[#57CC99] text-white hover:bg-purple-700">Đăng ký</Button>
                        <p className="text-center text-sm mt-2">
                            Đã có tài khoản? <a href="#" className="text-blue-500 hover:underline">Đăng nhập</a>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
