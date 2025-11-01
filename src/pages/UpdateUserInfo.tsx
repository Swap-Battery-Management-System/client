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
        address: "",
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

    // 🔹 Lấy danh sách tỉnh/thành
    useEffect(() => {
        axios
            .get("https://provinces.open-api.vn/api/p/")
            .then((res) => setProvinces(res.data))
            .catch(() => toast.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    // 🔹 Lấy thông tin người dùng
    useEffect(() => {
        if (!userId || provinces.length === 0) return;
        (async () => {
            try {
                console.log("🔍 Fetch user:", `/users/${userId}`);
                const res = await api.get(`/users/${userId}`, { withCredentials: true });
                const u = res.data.data?.user || res.data.data || res.data;
                console.log("✅ User data:", u);

                // Tách địa chỉ
                let detailAddress = "",
                    wardName = "",
                    districtName = "",
                    cityName = "",
                    country = "Việt Nam";

                if (u.address) {
                    const parts = u.address.split(",").map((p: string) => p.trim());
                    [detailAddress, wardName, districtName, cityName, country] = parts.slice(0, 5);
                }

                setForm((prev) => ({
                    ...prev,
                    fullname: u.fullName || "",
                    username: u.username || "",
                    email: u.email || "",
                    phoneNumber: u.phoneNumber || "",
                    gender: u.gender === true ? "male" : u.gender === false ? "female" : "",
                    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
                    avatarUrl: u.avatarUrl || u.avatar_url || u.avatar || "",
                    status: u.status || "",
                    role: u.role?.roleName || "",
                    country,
                    detailAddress,
                    address: u.address || "",
                }));

                setPreview(u.avatarUrl || u.avatar_url || u.avatar || null);

                // Load dropdown địa chỉ
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
                console.error("❌ Lỗi /users/{id}:", err.response?.data || err.message);
                toast.error("Không thể tải thông tin người dùng!");
            }
        })();
    }, [userId, provinces.length]);

    // 🔹 Sự kiện change input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Load danh sách huyện
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

    // 🔹 Load danh sách xã
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

    // 🔹 Upload ảnh lên Cloudinary
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        toast.info("Đang tải ảnh lên Cloudinary...");

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "swapnet_avatars");

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!data.secure_url) throw new Error("Upload thất bại");

            const uploadedUrl = data.secure_url;
            setForm((prev) => ({ ...prev, avatar: file, avatarUrl: uploadedUrl }));
            setPreview(uploadedUrl);

            await api.patch(`/users/${userId}/complete`, { avatarUrl: uploadedUrl }, { withCredentials: true });

            toast.success("Ảnh đại diện đã được cập nhật!");
        } catch (err: any) {
            console.error("❌ Lỗi upload:", err);
            toast.error("Không thể tải hoặc lưu ảnh!");
        } finally {
            setUploading(false);
        }
    };

    //  Cập nhật toàn bộ thông tin
    const handleUpdate = async () => {
        if (!form.fullname || !form.username || !form.phoneNumber)
            return toast.error("Vui lòng nhập đầy đủ thông tin cá nhân!");

        // ✅ Kiểm tra địa chỉ (chỉ khi quốc gia là Việt Nam)
        if (form.country === "Việt Nam") {
            if (!form.city || !form.district || !form.ward || !form.detailAddress) {
                return toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Xã/Phường và nhập địa chỉ cụ thể!");
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
            const res = await api.patch(
                `/users/${userId}/complete`,
                {
                    fullName: form.fullname,
                    username: form.username,
                    phoneNumber: form.phoneNumber,
                    gender:
                        form.gender === "male" ? true : form.gender === "female" ? false : null,
                    dateOfBirth: form.dateOfBirth,
                    avatarUrl: form.avatarUrl,
                    address,
                },
                { withCredentials: true }
            );

            console.log("✅ PATCH response:", res.data);
            toast.success("Cập nhật thông tin thành công!");
        } catch (err: any) {
            console.error("❌ Lỗi khi PATCH:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Không thể cập nhật!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-5">
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

                    <div>
                        <Label>Trạng thái</Label>
                        <Input value={form.status} disabled className="bg-gray-100 text-sm" />
                    </div>
                    <div>
                        <Label>Vai trò</Label>
                        <Input value={form.role} disabled className="bg-gray-100 text-sm" />
                    </div>

                    <div className="mt-2">
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

                        {/* Địa chỉ chi tiết */}
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


                    <Button
                        className="mt-6 w-1/2 bg-[#57CC99] text-white hover:bg-[#38A3A5] disabled:opacity-50"
                        onClick={handleUpdate}
                        disabled={loading || uploading}
                    >
                        {loading ? "Đang cập nhật..." : uploading ? "Đang tải ảnh..." : "Cập nhật"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
