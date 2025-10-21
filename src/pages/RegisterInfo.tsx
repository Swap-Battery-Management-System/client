import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function RegisterInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [form, setForm] = useState({
        fullname: "",
        username: "",
        phoneNumber: "",
        address: "",
        gender: "",
        dateOfBirth: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleComplete = async () => {
        // ✅ Validate input
        if (!form.fullname || !form.username || !form.phoneNumber || !form.gender || !form.dateOfBirth)
            return toast.error("Vui lòng nhập đầy đủ thông tin!");

        try {
            // ✅ Gọi API hoàn tất thông tin
            await api.patch(
                "/users/complete",
                {
                    fullname: form.fullname,
                    username: form.username,
                    phoneNumber: form.phoneNumber,
                    gender: form.gender === "male", // true/false
                    dateOfBirth: form.dateOfBirth,
                    address: form.address,
                },
                { withCredentials: true }
            );

            toast.success("Hoàn tất đăng ký thành công!");
            navigate("/login");
        } catch (err: any) {
            console.error("Error:", err.response || err);
            toast.error(err.response?.data?.message || "Không thể hoàn tất đăng ký!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[520px] p-6 rounded-2xl shadow-lg bg-white">
                <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-2">
                    Thông tin cá nhân
                </h2>
                <p className="text-center text-gray-600 mb-4">
                    Hãy nhập đầy đủ thông tin để kích hoạt tài khoản của bạn.
                </p>
                <Separator className="mb-4" />

                <div className="space-y-3">
                    <div>
                        <Label>Họ và tên</Label>
                        <Input name="fullname" placeholder="VD: Nguyễn Văn A" onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <Input name="username" placeholder="VD: driver001" onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input name="phoneNumber" placeholder="VD: 0901234567" onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Địa chỉ</Label>
                        <Input name="address" placeholder="VD: Quận 7, TP.HCM" onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Giới tính</Label>
                        <select
                            name="gender"
                            onChange={handleChange}
                            className="w-full border-2 border-emerald-500 rounded-md p-2"
                        >
                            <option value="">-- Chọn giới tính --</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                        </select>
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input type="date" name="dateOfBirth" onChange={handleChange} />
                    </div>
                </div>

                <Button
                    className="mt-6 w-full bg-[#57CC99] text-white hover:bg-[#38A3A5]"
                    onClick={handleComplete}
                >
                    Hoàn tất đăng ký
                </Button>
            </Card>
        </div>
    );
}
