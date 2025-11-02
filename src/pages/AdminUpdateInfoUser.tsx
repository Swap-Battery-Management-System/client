import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

export default function AdminUpdateInfoUser({ userId }: { userId: string }) {
    const [form, setForm] = useState({
        fullname: "",
        username: "",
        email: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        avatarUrl: "",
        status: "",
        role: "",
        avatar: null as File | null,
        country: "Việt Nam",
        city: "",
        district: "",
        ward: "",
        detailAddress: "",
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    // Lấy danh sách tỉnh
    useEffect(() => {
        axios
            .get("https://provinces.open-api.vn/api/p/")
            .then((res) => setProvinces(res.data))
            .catch(() => toast.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    // Lấy thông tin user theo userId
    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const res = await api.get(`/users/${userId}`);
                const u = res.data.data.user;
                console.log("User data:", u);

                // Xử lý địa chỉ
                let detailAddress = "", wardName = "", districtName = "", cityName = "", country = "Việt Nam";
                if (u.address) {
                    const parts = u.address.split(",").map((p: string) => p.trim());
                    [detailAddress, wardName, districtName, cityName, country] = parts.slice(-5);
                }

                setForm((prev) => ({
                    ...prev,
                    fullname: u.fullName || "",
                    username: u.username || "",
                    email: u.email || "",
                    phoneNumber: u.phoneNumber || "",
                    gender: u.gender === true ? "male" : u.gender === false ? "female" : "",
                    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
                    avatarUrl: u.avatarUrl || "",
                    status: u.status || "",
                    role: u.role?.roleName || "",
                    country,
                    detailAddress,
                }));
                setPreview(u.avatarUrl || null);
            } catch (err: any) {
                console.error("❌ Lỗi khi tải user:", err);
                toast.error("Không thể tải thông tin người dùng!");
            }
        })();
    }, [userId]);

    // Thay đổi input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Tải ảnh avatar
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        toast.info("Đang tải ảnh lên...");
        try {
            const fd = new FormData();
            fd.append("key", "4a4efdffaf66aa2a958ea43ace6f49c1");
            fd.append("image", file);
            const res = await axios.post("https://api.imgbb.com/1/upload", fd);
            const uploadedUrl = res.data.data.url;
            setForm({ ...form, avatar: file, avatarUrl: uploadedUrl });
            toast.success("Ảnh đã tải lên thành công!");
        } catch {
            toast.error("Không thể tải ảnh lên!");
        } finally {
            setUploading(false);
        }
    };

    // Cập nhật thông tin
    const handleUpdate = async () => {
        if (!form.fullname || !form.username || !form.phoneNumber)
            return toast.error("Vui lòng nhập đầy đủ thông tin!");

        setLoading(true);
        try {
            await api.patch(`/users/${userId}/complete`, {
                fullName: form.fullname,
                username: form.username,
                phoneNumber: form.phoneNumber,
                gender: form.gender === "male",
                dateOfBirth: form.dateOfBirth,
                avatarUrl: form.avatarUrl,
                address: form.detailAddress,
            });
            toast.success("Cập nhật thông tin thành công!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể cập nhật!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#38A3A5] text-center">Cập nhật thông tin người dùng</h2>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center w-full md:w-1/3">
                    <div className="relative w-28 h-28">
                        <img
                            src={preview || form.avatarUrl || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                            alt="Avatar"
                            className="w-28 h-28 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[#38A3A5] font-medium text-sm rounded-full">
                                ...
                            </div>
                        )}
                    </div>
                    <label
                        htmlFor="avatar-upload"
                        className="flex items-center gap-2 mt-3 bg-[#57CC99] hover:bg-[#38A3A5] text-white font-medium py-1.5 px-3 rounded-md text-sm cursor-pointer transition"
                    >
                        <UploadCloud size={16} />
                        Đổi ảnh
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                {/* Form */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <Label>Họ và tên</Label>
                        <Input name="fullname" value={form.fullname} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <Input name="username" value={form.username} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input name="email" value={form.email} disabled className="bg-gray-100 text-sm" />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Giới tính</Label>
                        <div className="flex items-center gap-6 mt-1">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="gender" value="male" checked={form.gender === "male"} onChange={handleChange} className="accent-emerald-500" />
                                Nam
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="gender" value="female" checked={form.gender === "female"} onChange={handleChange} className="accent-emerald-500" />
                                Nữ
                            </label>
                        </div>
                    </div>
                    <div>
                        <Label>Trạng thái</Label>
                        <Input value={form.status} disabled className="bg-gray-100 text-sm" />
                    </div>
                    <div>
                        <Label>Vai trò</Label>
                        <Input value={form.role} disabled className="bg-gray-100 text-sm" />
                    </div>
                    <div className="col-span-2 mt-4">
                        <Label>Địa chỉ</Label>
                        <Input name="detailAddress" value={form.detailAddress} onChange={handleChange} placeholder="VD: 12 Nguyễn Văn Linh, Quận 7, TP.HCM" />
                    </div>
                </div>
            </div>

            <Button className="mt-4 w-1/2 mx-auto bg-[#57CC99] text-white hover:bg-[#38A3A5]" onClick={handleUpdate} disabled={loading || uploading}>
                {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </Button>
        </div>
    );
}
