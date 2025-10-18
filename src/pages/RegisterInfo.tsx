import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function RegisterInfo() {
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await api.patch("/users/complete", {
                full_name: "Nguyễn Văn A",
                phone: "0987654321",
                address: "Hà Nội",
                gender: "male",
                birth_date: "2005-01-01",
                username: "driver001",
            });
            toast.success("Đăng ký hoàn tất!");
            navigate("/login");
        } catch {
            toast.error("Không thể lưu thông tin!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[800px] p-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-green-500 mb-4">
                    Hoàn tất hồ sơ
                </h2>
                <Separator className="mb-4" />

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label>Họ và tên</Label>
                        <Input placeholder="Nhập họ tên" />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input type="tel" placeholder="Nhập số điện thoại" />
                    </div>
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <Input placeholder="Tên đăng nhập" />
                    </div>
                    <div>
                        <Label>Địa chỉ</Label>
                        <Input placeholder="Địa chỉ" />
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input type="date" />
                    </div>
                    <div>
                        <Label>Giới tính</Label>
                        <select className="border-2 border-emerald-500 rounded-md w-full p-2">
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Button
                        className="bg-[#57CC99] hover:bg-[#38A3A5] text-white px-6"
                        onClick={handleSubmit}
                    >
                        Hoàn tất đăng ký
                    </Button>
                </div>
            </Card>
        </div>
    );
}
