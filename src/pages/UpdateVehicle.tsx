"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

interface Vehicle {
    id: string;
    licensePlates: string;
    name: string;
    VIN: string;
    status: string;
    batteryId?: string;
    model?: {
        id: string;
        name: string;
        manufacturer?: string;
    };
}

export default function UpdateVehicle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        licensePlates: "",
        VIN: "",
        status: "",
        // batteryId: "",
    });

    // --- Lấy thông tin xe từ API ---
    useEffect(() => {
        const fetchVehicle = async () => {
            if (!id) {
                toast.error("Không tìm thấy ID xe trong URL!");
                navigate("/home/my-vehicles");
                return;
            }

            try {
                setLoading(true);
                console.log(" Gọi API: /vehicles/" + id);

                const res = await api.get(`/vehicles/${id}`, { withCredentials: true });
                console.log(" Kết quả từ API:", res.data);

                const v = res.data?.data?.vehicle;

                if (!v) {
                    toast.error("Không tìm thấy thông tin xe!");
                    navigate("/home/my-vehicles");
                    return;
                }

                setVehicle(v);
                setFormData({
                    name: v.name || "",
                    licensePlates: v.licensePlates || "",
                    VIN: v.VIN || "",
                    status: v.status || "",
                    // batteryId: v.batteryId || "",
                });
            } catch (err) {
                console.error(" Lỗi khi tải xe:", err);
                toast.error("Không thể tải thông tin xe!");
                navigate("/home/my-vehicles");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [id, navigate]);

    // --- Cập nhật giá trị khi nhập ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Gửi PATCH chỉ cập nhật name và licensePlates ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle) return;

        try {
            const body = {
                name: formData.name.trim(),
                licensePlates: formData.licensePlates.trim(),
            };

            console.log(" PATCH body gửi lên:", body);
            const res = await api.patch(`/vehicles/${id}`, body, { withCredentials: true });
            console.log(" Phản hồi cập nhật:", res.data);

            if (res.data?.status === "success" || res.data?.success || res.status === 200) {
                //toast.success(" Cập nhật xe thành công!");
                navigate("/home/my-vehicles");
            } else {
                toast.error("Không thể cập nhật xe!");
            }
        } catch (err) {
            console.error(" Lỗi khi cập nhật xe:", err);
            toast.error("Đã xảy ra lỗi khi cập nhật xe!");
        }
    };

    // --- Hiển thị khi đang tải hoặc không tìm thấy xe ---
    if (loading)
        return <div className="text-center text-gray-600 mt-10">Đang tải thông tin xe...</div>;

    if (!vehicle)
        return (
            <div className="text-center text-red-500 mt-10">
                Không tìm thấy thông tin xe.
                <Button onClick={() => navigate("/home/my-vehicles")} className="ml-2">
                    Quay lại
                </Button>
            </div>
        );

    // --- Giao diện form ---
    return (
        <div className="flex justify-center mt-10">
            <Card className="p-8 w-full max-w-lg bg-white/80 border border-[#BCE7E8] shadow-lg rounded-2xl">
                <h2 className="text-2xl font-semibold text-center text-[#38A3A5] mb-6">
                    Cập nhật thông tin xe
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Tên xe */}
                    <div>
                        <Label className="text-[#38A3A5] mb-2">Tên xe</Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Biển số xe */}
                    <div>
                        <Label className="text-[#38A3A5] mb-2">Biển số xe</Label>
                        <Input
                            name="licensePlates"
                            value={formData.licensePlates}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Các trường khác (không chỉnh sửa) */}
                    <div>
                        <Label className="text-[#38A3A5] mb-2">Số khung (VIN)</Label>
                        <Input value={formData.VIN} readOnly className="bg-gray-100" />
                    </div>

                    {/* <div>
                        <Label className="text-[#38A3A5]">Battery ID</Label>
                        <Input value={formData.batteryId} readOnly className="bg-gray-100" />
                    </div> */}

                    <div>
                        <Label className="text-[#38A3A5] mb-2">Trạng thái</Label>
                        <Input value={formData.status} readOnly className="bg-gray-100" />
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/home/my-vehicles")}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#38A3A5] hover:bg-[#2C8C8E] text-white"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
