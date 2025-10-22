import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface Vehicle {
    id: string;
    licensePlates: string;
    VIN: string;
    status: string; // “pending”, “approved”, “rejected”...
    model?: {
        id: string;
        name: string;
        manufacturer?: string;
    };
    createdAt: string;
    modelId?: string;
}

export default function MyVehicles() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    //  Lấy danh sách xe người dùng hiện tại
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Bạn cần đăng nhập để xem danh sách xe!");
                return;
            }

            const res = await api.get("/vehicles", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            console.log("🚗 API trả về:", res.data);

            const data =
                res?.data?.data?.vehicle ||
                res?.data?.vehicle ||
                res?.data?.data ||
                [];

            if (!Array.isArray(data)) {
                throw new Error("Phản hồi không hợp lệ từ máy chủ.");
            }

            setVehicles(data);
        } catch (err) {
            console.error("❌ Lỗi khi lấy danh sách xe:", err);
            toast.error("Không thể tải danh sách xe!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    //  Mở modal xem chi tiết
    const handleViewDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setOpen(true);
    };

    return (
        <div className="flex h-screen bg-[#E9F8F8]">
            <main className="flex-1 p-8">
                <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
                    Danh sách xe của tôi
                </h1>

                {/* 🌀 Loading */}
                {loading && (
                    <div className="text-center text-gray-500 mt-10 animate-pulse">
                        Đang tải danh sách xe...
                    </div>
                )}

                {/* Nếu chưa có xe */}
                {!loading && vehicles.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        Bạn chưa đăng ký xe nào.
                    </div>
                )}

                {/* Danh sách xe */}
                {!loading && vehicles.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((v) => (
                            <Card
                                key={v.id}
                                className="p-5 bg-white/80 border border-[#BCE7E8] shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-[#38A3A5]">
                                        {v.licensePlates}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Model: {v.model?.name || "Không rõ"}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        Số khung (VIN): {v.VIN}
                                    </p>
                                    <p
                                        className={`text-sm font-medium ${v.status === "approved"
                                            ? "text-green-600"
                                            : v.status === "pending"
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        Trạng thái:{" "}
                                        {v.status === "pending"
                                            ? "Đang chờ duyệt"
                                            : v.status === "approved"
                                                ? "Đã duyệt"
                                                : "Từ chối"}
                                    </p>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button
                                        variant="outline"
                                        className="text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
                                        onClick={() => handleViewDetails(v)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal xem chi tiết */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-md bg-white rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#38A3A5] text-lg">
                                Chi tiết xe
                            </DialogTitle>
                            <DialogDescription>
                                Thông tin chi tiết về xe bạn đã đăng ký
                            </DialogDescription>
                        </DialogHeader>

                        {selectedVehicle && (
                            <div className="space-y-3 mt-3">
                                <div>
                                    <Label className="text-[#38A3A5]">Biển số:</Label>
                                    <p>{selectedVehicle.licensePlates}</p>
                                </div>
                                <div>
                                    <Label className="text-[#38A3A5]">Model:</Label>
                                    <p>{selectedVehicle.model?.name || "Không rõ"}</p>
                                </div>
                                <div>
                                    <Label className="text-[#38A3A5]">Số khung (VIN):</Label>
                                    <p>{selectedVehicle.VIN}</p>
                                </div>
                                <div>
                                    <Label className="text-[#38A3A5]">Trạng thái:</Label>
                                    <p>
                                        {selectedVehicle.status === "pending"
                                            ? "Đang chờ duyệt"
                                            : selectedVehicle.status === "approved"
                                                ? "Đã duyệt"
                                                : "Từ chối"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-[#38A3A5]">Ngày đăng ký:</Label>
                                    <p>
                                        {new Date(
                                            selectedVehicle.createdAt
                                        ).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <Button
                                onClick={() => setOpen(false)}
                                className="bg-[#38A3A5] hover:bg-[#2C8C8E] text-white"
                            >
                                Đóng
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
