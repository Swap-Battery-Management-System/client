import axios from "axios";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddressSelector({ form, setForm }: any) {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [errors, setErrors] = useState({
        country: false,
        city: false,
        district: false,
        ward: false,
        detailAddress: false,
    });

    // 🗺️ Lấy danh sách tỉnh/thành
    useEffect(() => {
        axios
            .get("https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json")
            .then((res) => setProvinces(res.data))
            .catch(() => toast.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    // 🏳️ Quốc gia
    const handleCountryChange = (e: any) => {
        const country = e.target.value;
        setForm({
            ...form,
            country,
            city: "",
            district: "",
            ward: "",
            detailAddress: "",
        });
        setDistricts([]);
        setWards([]);
        setErrors({ country: false, city: false, district: false, ward: false, detailAddress: false });
        if (country !== "Việt Nam") {
            toast.error("Ứng dụng chỉ hỗ trợ người dùng tại Việt Nam 🇻🇳");
        }
    };

    const isVietnam = form.country === "Việt Nam";

    // 🏙️ Tỉnh / Thành phố
    const handleCityChange = (e: any) => {
        if (!form.country) {
            toast.error("Vui lòng chọn Quốc gia trước!");
            setErrors((prev) => ({ ...prev, country: true }));
            return;
        }

        const id = e.target.value;
        const selected = provinces.find((p) => p.Id === id);
        setDistricts(selected?.Districts || []);
        setWards([]);
        setForm({
            ...form,
            city: selected?.Name || "",
            district: "",
            ward: "",
        });
        setErrors((prev) => ({ ...prev, city: false }));
    };

    // 🏘️ Quận / Huyện
    const handleDistrictChange = (e: any) => {
        if (!form.city || !form.country) {
            toast.error("Vui lòng chọn Tỉnh / Thành phố trước!");
            setErrors((prev) => ({ ...prev, city: true }));
            return;
        }

        const id = e.target.value;
        const selected = districts.find((d) => d.Id === id);
        setWards(selected?.Wards || []);
        setForm({
            ...form,
            district: selected?.Name || "",
            ward: "",
        });
        setErrors((prev) => ({ ...prev, district: false }));
    };

    // 🏡 Xã / Phường
    const handleWardChange = (e: any) => {
        if (!form.district || !form.city || !form.country) {
            toast.error("Vui lòng chọn Quận / Huyện trước!");
            setErrors((prev) => ({ ...prev, district: true }));
            return;
        }

        const id = e.target.value;
        const selected = wards.find((w) => w.Id === id);
        setForm({
            ...form,
            ward: selected?.Name || "",
        });
        setErrors((prev) => ({ ...prev, ward: false }));
    };

    // 🏠 Địa chỉ cụ thể
    const handleDetailAddressChange = (e: any) => {
        if (!form.ward || !form.district || !form.city || !form.country) {
            toast.error("Vui lòng chọn đầy đủ địa chỉ trước khi nhập địa chỉ cụ thể!");
            return;
        }
        setForm({ ...form, detailAddress: e.target.value });
        setErrors((prev) => ({ ...prev, detailAddress: false }));
    };

    // ✅ Kiểm tra tất cả trường trước khi submit (xuất ra ngoài dùng)
    const validateAllFields = () => {
        const newErrors = {
            country: !form.country,
            city: !form.city,
            district: !form.district,
            ward: !form.ward,
            detailAddress: !form.detailAddress.trim(),
        };
        setErrors(newErrors);

        const missing = Object.entries(newErrors)
            .filter(([_, val]) => val)
            .map(([key]) => key);

        if (missing.length > 0) {
            toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ!");
            return false;
        }
        return true;
    };

    // 👉 Gửi hàm validate ra ngoài component cha
    (AddressSelector as any).validate = validateAllFields;

    return (
        <div className="pt-4 border-t border-emerald-100 mt-4">
            <h3 className="text-base font-semibold text-[#38A3A5] flex items-center gap-1 mb-4">
                Địa chỉ cư trú <span className="text-red-500">*</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quốc gia */}
                <div>
                    <Label className="flex items-center gap-1 mb-1">
                        Quốc gia <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={form.country || ""}
                        onChange={handleCountryChange}
                        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.country ? "border-red-400 ring-red-400" : ""
                            }`}
                    >
                        <option value="">-- Chọn quốc gia --</option>
                        <option value="Việt Nam">Việt Nam</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                {/* Tỉnh / Thành phố */}
                <div>
                    <Label className="flex items-center gap-1 mb-1">
                        Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={provinces.find((p) => p.Name === form.city)?.Id || ""}
                        onChange={handleCityChange}
                        disabled={!isVietnam || !form.country}
                        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.city ? "border-red-400 ring-red-400" : ""
                            }`}
                    >
                        <option value="">-- Chọn tỉnh/thành phố --</option>
                        {provinces.map((p) => (
                            <option key={p.Id} value={p.Id}>
                                {p.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quận / Huyện */}
                <div>
                    <Label className="flex items-center gap-1 mb-1">
                        Quận / Huyện <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={districts.find((d) => d.Name === form.district)?.Id || ""}
                        onChange={handleDistrictChange}
                        disabled={!form.city || !form.country}
                        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.district ? "border-red-400 ring-red-400" : ""
                            }`}
                    >
                        <option value="">-- Chọn quận/huyện --</option>
                        {districts.map((d) => (
                            <option key={d.Id} value={d.Id}>
                                {d.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Xã / Phường */}
                <div>
                    <Label className="flex items-center gap-1 mb-1">
                        Xã / Phường <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={wards.find((w) => w.Name === form.ward)?.Id || ""}
                        onChange={handleWardChange}
                        disabled={!form.district || !form.city || !form.country}
                        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.ward ? "border-red-400 ring-red-400" : ""
                            }`}
                    >
                        <option value="">-- Chọn xã/phường --</option>
                        {wards.map((w) => (
                            <option key={w.Id} value={w.Id}>
                                {w.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Địa chỉ cụ thể */}
                <div className="md:col-span-2">
                    <Label className="flex items-center gap-1 mb-1">
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </Label>
                    <input
                        name="detailAddress"
                        value={form.detailAddress}
                        onChange={handleDetailAddressChange}
                        placeholder="VD: 12 Nguyễn Văn Linh"
                        disabled={!form.ward || !form.district || !form.city || !form.country}
                        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${errors.detailAddress ? "border-red-400 ring-red-400" : ""
                            }`}
                    />
                </div>
            </div>
        </div>
    );
}
