import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
export default function UpdateUserInfo() {
    const { user } = useAuth();
    const userId = user?.id;

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

    //  Lấy danh sách tỉnh/thành
    useEffect(() => {
        axios
            .get("https://provinces.open-api.vn/api/p/")
            .then((res) => setProvinces(res.data))
            .catch(() => toast.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                console.log(" Gọi API lấy thông tin user:", `/users/${userId}`);
                const res = await api.get(`/users/${userId}`, { withCredentials: true });
                const u = res.data.data.user;
                console.log("Kết quả trả về:", u);

                // ✅ Tách địa chỉ (nếu có)
                let detailAddress = "";
                let wardName = "";
                let districtName = "";
                let cityName = "";
                let country = "Việt Nam";

                if (u.address) {
                    const parts = u.address.split(",").map((p: string) => p.trim());
                    if (parts.length >= 5) {
                        [detailAddress, wardName, districtName, cityName, country] = parts.slice(-5);
                    } else if (parts.length >= 4) {
                        [detailAddress, wardName, districtName, cityName] = parts.slice(-4);
                    }
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
                    country: country,
                    detailAddress: detailAddress,
                }));
                setPreview(u.avatarUrl || null);

                // ✅ Lấy lại mã code tương ứng để hiển thị đúng trong dropdown
                if (cityName) {
                    const cityObj = provinces.find((p) => p.name.includes(cityName));
                    if (cityObj) {
                        setForm((prev) => ({ ...prev, city: cityObj.code }));
                        const disRes = await axios.get(
                            `https://provinces.open-api.vn/api/p/${cityObj.code}?depth=2`
                        );
                        setDistricts(disRes.data.districts);
                        const distObj = disRes.data.districts.find((d: any) =>
                            d.name.includes(districtName)
                        );
                        if (distObj) {
                            setForm((prev) => ({ ...prev, district: distObj.code }));
                            const wardRes = await axios.get(
                                `https://provinces.open-api.vn/api/d/${distObj.code}?depth=2`
                            );
                            setWards(wardRes.data.wards);
                            const wardObj = wardRes.data.wards.find((w: any) =>
                                w.name.includes(wardName)
                            );
                            if (wardObj) setForm((prev) => ({ ...prev, ward: wardObj.code }));
                        }
                    }
                }
            } catch (err: any) {
                console.error("❌ Lỗi khi gọi API /users/{id}:", err.response?.data || err.message);
                toast.error("Không thể tải thông tin người dùng!");
            }
        })();
    }, [userId, provinces]);


    // Sự kiện change input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Chọn Tỉnh → load Huyện
    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceCode = e.target.value;
        setForm({ ...form, city: provinceCode, district: "", ward: "" });
        setWards([]);
        if (!provinceCode) return;
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            setDistricts(res.data.districts || []);
        } catch {
            toast.error("Không thể tải danh sách quận/huyện!");
        }
    };

    //  Chọn Huyện → load Xã
    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtCode = e.target.value;
        setForm({ ...form, district: districtCode, ward: "" });
        if (!districtCode) return;
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            setWards(res.data.wards || []);
        } catch {
            toast.error("Không thể tải danh sách xã/phường!");
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, ward: e.target.value });
    };

    //  Upload avatar
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

    const handleUpdate = async () => {
        if (!form.fullname || !form.username || !form.phoneNumber)
            return toast.error("Vui lòng nhập đầy đủ thông tin!");

        const cityName = provinces.find((p) => p.code == form.city)?.name || "";
        const districtName = districts.find((d) => d.code == form.district)?.name || "";
        const wardName = wards.find((w) => w.code == form.ward)?.name || "";

        const address = [form.detailAddress, wardName, districtName, cityName, form.country]
            .filter(Boolean)
            .join(", ");

        setLoading(true);
        try {
            await api.patch(
                `/users/${userId}/complete`,
                {
                    fullName: form.fullname,
                    username: form.username,
                    phoneNumber: form.phoneNumber,
                    gender: form.gender === "male",
                    dateOfBirth: form.dateOfBirth,
                    avatarUrl: form.avatarUrl,
                    address,
                },
                { withCredentials: true }
            );
            toast.success("Cập nhật thông tin thành công!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể cập nhật!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="text-center md:text-left mb-3">
                <h2 className="text-2xl font-bold text-[#38A3A5]">Cập nhật thông tin cá nhân</h2>
                <p className="text-gray-600 text-sm">
                    Thông tin hiện tại của bạn được hiển thị bên dưới. Bạn có thể chỉnh sửa và lưu lại.
                </p>
            </div>

            <div className="flex items-start gap-8 relative">
                <div className="absolute left-1/3 top-0 bottom-0 border-l border-gray-200"></div>

                {/* Avatar */}
                <div className="flex flex-col items-center justify-start w-1/3 pr-8">
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
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={uploading}
                    />
                </div>

                {/* Form */}
                <div className="flex-1 grid grid-cols-1 gap-3 pl-10">
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

                    {/* role và status chỉ hiển thị, không sửa */}
                    <div>
                        <Label>Trạng thái</Label>
                        <Input value={form.status} disabled className="bg-gray-100 text-sm" />
                    </div>
                    <div>
                        <Label>Vai trò</Label>
                        <Input value={form.role} disabled className="bg-gray-100 text-sm" />
                    </div>

                    {/* ==== Địa chỉ ==== */}
                    <div className="mt-2">
                        <h3 className="text-base font-semibold text-[#38A3A5] mb-2">Địa chỉ cư trú</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <Label>Tỉnh / Thành phố</Label>
                                <select
                                    name="city"
                                    value={form.city}
                                    onChange={handleCityChange}
                                    className="w-full border rounded-md p-2"
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
                                <Label>Quận / Huyện</Label>
                                <select
                                    name="district"
                                    value={form.district}
                                    onChange={handleDistrictChange}
                                    className="w-full border rounded-md p-2"
                                    disabled={!form.city}
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
                                <Label>Xã / Phường</Label>
                                <select
                                    name="ward"
                                    value={form.ward}
                                    onChange={handleWardChange}
                                    className="w-full border rounded-md p-2"
                                    disabled={!form.district}
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
                                <Label>Địa chỉ cụ thể</Label>
                                <Input
                                    name="detailAddress"
                                    value={form.detailAddress}
                                    placeholder="VD: 12 Nguyễn Văn Linh, Sky Garden 3"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nút cập nhật */}
                    <Button
                        className="mt-6 w-1/2 bg-[#57CC99] text-white hover:bg-[#38A3A5]"
                        onClick={handleUpdate}
                        disabled={loading || uploading}
                    >
                        {loading ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
