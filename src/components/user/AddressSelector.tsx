import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

export default function AddressSelector({ form, setForm }: any) {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    // 🗺️ Lấy danh sách tỉnh/thành
    useEffect(() => {
        axios
            .get(
                "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
            )
            .then((res) => setProvinces(res.data))
            .catch(() => toast.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    // 🏙️ Khi chọn Tỉnh / Thành phố
    const handleCityChange = (e: any) => {
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
    };

    // 🏘️ Khi chọn Quận / Huyện
    const handleDistrictChange = (e: any) => {
        const id = e.target.value;
        const selected = districts.find((d) => d.Id === id);
        setWards(selected?.Wards || []);
        setForm({
            ...form,
            district: selected?.Name || "",
            ward: "",
        });
    };

    // 🏡 Khi chọn Xã / Phường
    const handleWardChange = (e: any) => {
        const id = e.target.value;
        const selected = wards.find((w) => w.Id === id);
        setForm({
            ...form,
            ward: selected?.Name || "",
        });
    };

    // 🌏 Khi đổi quốc gia
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
        if (country !== "Việt Nam") {
            toast.error("Ứng dụng chỉ dành cho người dùng tại Việt Nam 🇻🇳");
        }
    };

    const isVietnam = form.country === "Việt Nam";

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
                        value={form.country || "Việt Nam"}
                        onChange={handleCountryChange}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
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
                        disabled={!isVietnam}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                        disabled={!form.city || !isVietnam}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                        disabled={!form.district || !isVietnam}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                        onChange={(e) => setForm({ ...form, detailAddress: e.target.value })}
                        placeholder="VD: 12 Nguyễn Văn Linh"
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        disabled={!isVietnam}
                    />
                </div>
            </div>
        </div>
    );
}
