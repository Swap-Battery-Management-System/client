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

    // 🔹 Lấy danh sách tỉnh
    useEffect(() => {
        axios
            .get("https://provinces.open-api.vn/api/p/")
            .then((res) => setProvinces(res.data))
            .catch(() => toast.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    // 🔹 Lấy thông tin user theo userId
    useEffect(() => {
        if (!userId || provinces.length === 0) return;
        (async () => {
            try {
                const res = await api.get(`/users/${userId}`);
                const u = res.data.data.user;
                console.log("User data:", u);

                let detailAddress = "",
                    wardName = "",
                    districtName = "",
                    cityName = "",
                    country = "Việt Nam";

                if (u.address) {
                    const parts = u.address.split(",").map((p: string) => p.trim());
                    [detailAddress, wardName, districtName, cityName, country] = parts.slice(
                        -5
                    );
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
    }, [userId, provinces.length]);

    // 🔹 Hàm change input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Thay đổi tỉnh
    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceCode = e.target.value;
        setForm({ ...form, city: provinceCode, district: "", ward: "" });
        setWards([]);
        if (!provinceCode) return;
        try {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
            );
            setDistricts(res.data.districts || []);
        } catch {
            toast.error("Không thể tải danh sách quận/huyện!");
        }
    };

    // 🔹 Thay đổi huyện
    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtCode = e.target.value;
        setForm({ ...form, district: districtCode, ward: "" });
        if (!districtCode) return;
        try {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
            );
            setWards(res.data.wards || []);
        } catch {
            toast.error("Không thể tải danh sách xã/phường!");
        }
    };

    // 🔹 Thay đổi xã
    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, ward: e.target.value });
    };

    // 🔹 Upload ảnh
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
    // Cập nhật thông tin người dùng
    const handleUpdate = async () => {
        if (!form.fullname || !form.username || !form.phoneNumber)
            return toast.error("Vui lòng nhập đầy đủ thông tin!");

        if (form.country === "Việt Nam") {
            if (!form.city || !form.district || !form.ward || !form.detailAddress) {
                return toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Xã/Phường và nhập địa chỉ cụ thể của người dùng!");
            }
        }

        const cityName = provinces.find((p) => p.code == form.city)?.name || "";
        const districtName = districts.find((d) => d.code == form.district)?.name || "";
        const wardName = wards.find((w) => w.code == form.ward)?.name || "";

        const address = [form.detailAddress, wardName, districtName, cityName, form.country]
            .filter(Boolean)
            .join(", ");

        setLoading(true);
        try {
            const res = await api.patch(`/users/${userId}`, {
                fullName: form.fullname,
                username: form.username,
                phoneNumber: form.phoneNumber,
                address,
                gender: form.gender === "male" ? true : false,
                avatarUrl: form.avatarUrl,
                dateOfBirth: form.dateOfBirth,
            });

            console.log("✅ PATCH response:", res.data);
            toast.success("Cập nhật thông tin người dùng thành công!");
        } catch (err: any) {
            console.error("❌ PATCH /users/{id} lỗi:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Không thể cập nhật!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">

            <h2 className="text-xl font-bold text-[#38A3A5] text-center">
                Cập nhật thông tin người dùng
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center w-full md:w-1/3">
                    <div className="relative w-28 h-28">
                        <img
                            src={
                                preview ||
                                form.avatarUrl ||
                                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                            }
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
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
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
                        <Input
                            name="email"
                            value={form.email}
                            disabled
                            className="bg-gray-100 text-sm"
                        />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input
                            type="date"
                            name="dateOfBirth"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label>Giới tính</Label>
                        <div className="flex items-center gap-6 mt-1">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={form.gender === "male"}
                                    onChange={handleChange}
                                    className="accent-emerald-500"
                                />
                                Nam
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={form.gender === "female"}
                                    onChange={handleChange}
                                    className="accent-emerald-500"
                                />
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

                    {/* === Địa chỉ === */}
                    <div className="col-span-2 mt-4">
                        <h3 className="text-base font-semibold text-[#38A3A5] mb-2">
                            Địa chỉ cư trú
                        </h3>

                        {/* Quốc gia */}
                        <div className="mb-3">
                            <Label className="mb-1.5 block">Quốc gia</Label>
                            <select
                                name="country"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="Việt Nam">Việt Nam</option>
                                <option value="Khác">Khác</option>
                            </select>
                            {form.country !== "Việt Nam" && (
                                <p className="text-sm text-red-600 mt-1">
                                    ⚠️ Ứng dụng này hiện tại chỉ hỗ trợ người cư trú tại Việt Nam.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label className="mb-1.5 block">Tỉnh / Thành phố</Label>
                                <select
                                    name="city"
                                    value={form.city}
                                    onChange={handleCityChange}
                                    className="w-full border rounded-md p-2"
                                    disabled={form.country !== "Việt Nam"}
                                >
                                    <option value="">-- Chọn tỉnh/thành phố --</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Quận / Huyện</Label>
                                <select
                                    name="district"
                                    value={form.district}
                                    onChange={handleDistrictChange}
                                    className="w-full border rounded-md p-2"
                                    disabled={!form.city || form.country !== "Việt Nam"}
                                >
                                    <option value="">-- Chọn quận/huyện --</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.code}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Xã / Phường</Label>
                                <select
                                    name="ward"
                                    value={form.ward}
                                    onChange={handleWardChange}
                                    className="w-full border rounded-md p-2"
                                    disabled={!form.district || form.country !== "Việt Nam"}
                                >
                                    <option value="">-- Chọn xã/phường --</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Địa chỉ cụ thể</Label>
                                <Input
                                    name="detailAddress"
                                    value={form.detailAddress}
                                    placeholder="VD: 12 Nguyễn Văn Linh, Sky Garden 3"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                className="mt-4 w-1/2 mx-auto bg-[#57CC99] text-white hover:bg-[#38A3A5]"
                onClick={handleUpdate}
                disabled={loading || uploading}
            >
                {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </Button>
        </div>
    );
}
