import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import axios from "axios";
import { UploadCloud } from "lucide-react";

export default function RegisterInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || localStorage.getItem("pendingEmail");
    const userId = location.state?.userId;
    const [form, setForm] = useState({
        fullName: "",
        username: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        country: "",
        city: "",
        district: "",
        ward: "",
        detailAddress: "",
        avatar: null as File | null,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm({ ...form, avatar: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadToImgBB = async (file: File) => {
        const formData = new FormData();
        formData.append("key", "4a4efdffaf66aa2a958ea43ace6f49c1");
        formData.append("image", file);
        const res = await axios.post("https://api.imgbb.com/1/upload", formData);
        return res.data.data.url;
    };

    const handleComplete = async () => {
        if (!form.fullName || !form.username || !form.phoneNumber || !form.gender || !form.dateOfBirth)
            return toast.error("Vui lòng nhập đầy đủ thông tin!");

        if (!userId) return toast.error("Không tìm thấy ID người dùng!");

        setLoading(true);
        try {
            let avatarUrl = "";
            if (form.avatar) {
                toast.info("Đang tải ảnh lên...");
                avatarUrl = await uploadToImgBB(form.avatar);
            }

            // ✅ Gộp địa chỉ đầy đủ
            const address = [
                form.detailAddress,
                form.ward,
                form.district,
                form.city,
                form.country,
            ]
                .filter(Boolean)
                .join(", ");

            // ✅ Gọi API theo chuẩn mới
            await api.patch(
                `/users/${userId}/complete`,
                {
                    fullName: form.fullName,
                    username: form.username,
                    phoneNumber: form.phoneNumber,
                    address,
                    gender: form.gender === "male",
                    avatarUrl,
                    dateOfBirth: form.dateOfBirth,
                },
                { withCredentials: true }
            );

            toast.success("Cập nhật thông tin thành công!");
            localStorage.removeItem("pendingEmail");
            navigate("/login");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Không thể hoàn tất đăng ký!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[900px] p-8 rounded-2xl shadow-xl bg-white flex flex-col md:flex-row gap-8">
                {/* ==== LEFT: ẢNH ==== */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/3 border-r border-gray-200 pr-4">
                    <h3 className="text-lg font-semibold mb-3 text-[#38A3A5]">Ảnh đại diện</h3>
                    <div className="relative w-40 h-40">
                        <img
                            src={preview || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                            alt="Avatar"
                            className="w-40 h-40 rounded-xl object-cover border-2 border-emerald-400 shadow-sm"
                        />
                    </div>

                    <label
                        htmlFor="avatar-upload"
                        className="flex items-center gap-2 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition"
                    >
                        <UploadCloud size={18} />
                        Chọn ảnh
                    </label>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </div>

                {/* ==== RIGHT: FORM ==== */}
                <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-bold text-[#38A3A5] mb-1 text-center md:text-left">
                        Thông tin cá nhân
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 text-center md:text-left">
                        Vui lòng nhập đầy đủ thông tin để kích hoạt tài khoản.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-0.5 block">Họ và tên:</Label>
                            <Input name="fullName" placeholder="VD: Nguyễn Văn A" onChange={handleChange} />
                        </div>
                        <div>
                            <Label className="mb-0.5 block">Tên đăng nhập:</Label>
                            <Input name="username" placeholder="VD: driver001" onChange={handleChange} />
                        </div>
                        <div>
                            <Label className="mb-0.5 block">Số điện thoại:</Label>
                            <Input name="phoneNumber" placeholder="VD: 0901234567" onChange={handleChange} />
                        </div>

                        {/* 🔘 Giới tính */}
                        <div className="flex flex-col">
                            <Label className="mb-0.5 block">Giới tính:</Label>
                            <div className="flex items-center gap-4 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        onChange={handleChange}
                                        className="accent-emerald-500 w-4 h-4"
                                    />
                                    Nam
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        onChange={handleChange}
                                        className="accent-emerald-500 w-4 h-4"
                                    />
                                    Nữ
                                </label>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-0.5 block">Ngày sinh:</Label>
                            <Input type="date" name="dateOfBirth" onChange={handleChange} />
                        </div>

                        {/* ===== ĐỊA CHỈ ===== */}
                        <div className="col-span-2 mt-2">
                            <h3 className="text-base font-semibold text-[#38A3A5] mb-2">Địa chỉ cư trú:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <Label className="mb-0.5 block">Quốc gia:</Label>
                                    <Input name="country" placeholder="VD: Việt Nam" onChange={handleChange} />
                                </div>
                                <div>
                                    <Label className="mb-0.5 block">Thành phố / Tỉnh:</Label>
                                    <Input name="city" placeholder="VD: TP. Hồ Chí Minh" onChange={handleChange} />
                                </div>
                                <div>
                                    <Label className="mb-0.5 block">Quận / Huyện:</Label>
                                    <Input name="district" placeholder="VD: Quận 7" onChange={handleChange} />
                                </div>
                                <div>
                                    <Label className="mb-0.5 block">Xã / Phường:</Label>
                                    <Input name="ward" placeholder="VD: Phường Tân Phong" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <Label className="mb-0.5 block">Địa chỉ cụ thể:</Label>
                                    <Input
                                        name="detailAddress"
                                        placeholder="VD: Số 12 Nguyễn Văn Linh, tòa Sky Garden 3"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="mt-6 w-full bg-[#57CC99] text-white hover:bg-[#38A3A5]"
                        onClick={handleComplete}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
