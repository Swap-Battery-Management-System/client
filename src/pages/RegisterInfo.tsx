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
import { useAuth } from "@/context/AuthContext";

export default function RegisterInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || localStorage.getItem("pendingEmail");
    // 🔹 Kiểm tra username
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [checkTimer, setCheckTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const checkAvailability = async (username: string) => {
        if (!username) return;
        setUsernameStatus("checking");

        try {
            const res = await api.post("/auth/check", { username });
            if (res.status === 204) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("taken");
            }
        } catch (err: any) {
            if ([400, 404].includes(err.response?.status)) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("taken");
            }
        }
    };


    const { user } = useAuth();
    const userId = user?.id;
    //  const userId = location.state?.userId || localStorage.getItem("pendingUserId");

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        country: "Việt Nam",
        city: "",
        district: "",
        ward: "",
        detailAddress: "",
        avatar: null as File | null,
        avatarUrl: "", // ✅ thêm để lưu link ảnh upload
    });
    const validateUsername = (username: string) => {
        if (!username.trim()) return "Tên đăng nhập không được để trống.";
        if (username.length < 5 || username.length > 20)
            return "Tên đăng nhập phải từ 5–20 ký tự.";
        if (!/^[A-Za-z]/.test(username))
            return "Ký tự đầu tiên phải là chữ cái.";
        if (!/^[A-Za-z0-9._]+$/.test(username))
            return "Chỉ được chứa chữ cái, số, dấu gạch dưới (_) hoặc dấu chấm (.)";
        if (/\s/.test(username))
            return "Không được chứa khoảng trắng.";
        return "";
    };

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

    const handleDistrictChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
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

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, ward: e.target.value });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Khi chọn ảnh -> tự upload lên ImgBB
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setUploading(true);
        toast.info("Đang tải ảnh lên...");

        try {
            const formData = new FormData();
            formData.append("key", "4a4efdffaf66aa2a958ea43ace6f49c1");
            formData.append("image", file);

            const res = await axios.post("https://api.imgbb.com/1/upload", formData);
            const uploadedUrl = res.data.data.url;

            setForm({ ...form, avatar: file, avatarUrl: uploadedUrl });
            toast.success("Ảnh đã tải lên thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải ảnh lên!");
        } finally {
            setUploading(false);
        }
    };
    const [usernameError, setUsernameError] = useState<string>("");
    const [ageError, setAgeError] = useState<string>("");
    const validateAge = (dateString: string) => {
        const birthDate = new Date(dateString);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Nếu tháng/ngày hiện tại chưa qua sinh nhật → trừ 1 tuổi
        const realAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        return realAge >= 18;
    };
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setForm({ ...form, username: value });

        // Kiểm tra hợp lệ tại client
        const validationMessage = validateUsername(value);
        setUsernameError(validationMessage);

        // Nếu có lỗi local thì không cần gọi API
        if (validationMessage) {
            setUsernameStatus("idle");
            if (checkTimer) clearTimeout(checkTimer);
            return;
        }

        // Nếu hợp lệ thì debounce check API
        if (checkTimer) clearTimeout(checkTimer);
        const timer = setTimeout(() => {
            checkAvailability(value);
        }, 500);
        setCheckTimer(timer);
    };


    // 🔹 Gửi form hoàn tất đăng ký
    const handleComplete = async () => {

        if (
            !form.fullName ||
            !form.username ||
            !form.phoneNumber ||
            !form.gender ||
            !form.dateOfBirth
        )
            return toast.error("Vui lòng nhập đầy đủ thông tin!");

        if (!userId) return toast.error("Không tìm thấy ID người dùng!");

        setLoading(true);
        try {
            const cityName = provinces.find((p) => p.code == form.city)?.name || "";
            const districtName =
                districts.find((d) => d.code == form.district)?.name || "";
            const wardName = wards.find((w) => w.code == form.ward)?.name || "";

            const address = [
                form.detailAddress,
                wardName,
                districtName,
                cityName,
                form.country,
            ]
                .filter(Boolean)
                .join(", ");
            if (!validateAge(form.dateOfBirth)) {
                toast.error("Người dùng phải đủ 18 tuổi để đăng ký!");
                return;
            }

            await api.patch(
                `/users/${userId}/complete`,
                {
                    fullName: form.fullName,
                    username: form.username,
                    phoneNumber: form.phoneNumber,
                    address,
                    gender: form.gender === "male",
                    avatarUrl: form.avatarUrl, // ✅ dùng link ảnh đã upload
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
                    <h3 className="text-lg font-semibold mb-3 text-[#38A3A5]">
                        Ảnh đại diện
                    </h3>
                    <div className="relative w-40 h-40">
                        <img
                            src={
                                preview ||
                                form.avatarUrl ||
                                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                            }
                            alt="Avatar"
                            className="w-40 h-40 rounded-xl object-cover border-2 border-emerald-400 shadow-sm"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[#38A3A5] font-medium text-sm rounded-xl">
                                Đang tải...
                            </div>
                        )}
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
                        disabled={uploading}
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

                    {/* ==== FORM FIELDS ==== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1.5 block">
                                Họ và tên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                name="fullName"
                                value={form.fullName}
                                placeholder="VD: Nguyễn Văn A"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label className="mb-1.5 block">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    name="username"
                                    value={form.username}
                                    placeholder="VD: driver001"
                                    onChange={handleUsernameChange}
                                    className="pr-10"
                                />

                                {/* Vòng tròn xoay khi đang kiểm tra */}
                                {usernameStatus === "checking" && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8" />
                                        </svg>
                                    </div>
                                )}

                                {/* Tick xanh nếu khả dụng */}
                                {usernameStatus === "available" && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}

                                {/* X đỏ nếu trùng */}
                                {usernameStatus === "taken" && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Hiển thị thông báo hợp lệ / lỗi của username */}
                            {usernameError && (
                                <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                            )}

                            {!usernameError && usernameStatus === "taken" && (
                                <p className="text-sm text-red-500 mt-1">Tên đăng nhập đã tồn tại.</p>
                            )}

                            {!usernameError && usernameStatus === "available" && (
                                <p className="text-sm text-green-600 mt-1">Tên đăng nhập khả dụng.</p>
                            )}


                        </div>

                        <div>
                            <Label className="mb-1.5 block">
                                Số điện thoại <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                name="phoneNumber"
                                value={form.phoneNumber}
                                placeholder="VD: 0901234567"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label className="mb-1.5 block">
                                Giới tính <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-4 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={form.gender === "male"}
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
                            <Label className="mb-1.5 block">
                                Ngày sinh <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                name="dateOfBirth"
                                value={form.dateOfBirth}
                                onChange={(e) => {
                                    handleChange(e);
                                    const value = e.target.value;
                                    if (!value) return setAgeError("");
                                    if (!validateAge(value)) {
                                        setAgeError("Người dùng phải từ 18 tuổi trở lên.");
                                    } else {
                                        setAgeError("");
                                    }
                                }}
                            />
                            {ageError && <p className="text-sm text-red-500 mt-1">{ageError}</p>}

                        </div>

                        {/* === Địa chỉ === */}
                        <div className="col-span-2 mt-2">
                            <h3 className="text-base font-semibold text-[#38A3A5] mb-2">
                                Địa chỉ cư trú:
                            </h3>

                            <div className="mb-3">
                                <Label className="mb-1.5 block">Quốc gia:</Label>
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
                                    <Label className="mb-1.5 block">
                                        Tỉnh / Thành phố <span className="text-red-500">*</span>
                                    </Label>
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
                                    <Label className="mb-1.5 block">
                                        Quận / Huyện <span className="text-red-500">*</span>
                                    </Label>
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
                                    <Label className="mb-1.5 block">
                                        Xã / Phường <span className="text-red-500">*</span>
                                    </Label>
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
                                    <Label className="mb-1.5 block">
                                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                                    </Label>
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

                    <Button
                        className="mt-6 w-full bg-[#57CC99] text-white hover:bg-[#38A3A5]"
                        onClick={handleComplete}
                        disabled={loading || uploading}
                    >
                        {loading ? "Đang xử lý..." : "Lưu hồ sơ"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
