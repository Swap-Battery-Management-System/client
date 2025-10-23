import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
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
    name: string;
    VIN: string;
    status: string;
    userId: string;
    model?: {
        id: string;
        name: string;
        manufacturer?: string;
    };
}

export default function MyVehicles() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    //  Lấy danh sách xe người dùng hiện tại
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const res = await api.get("/vehicles", { withCredentials: true });

            const data =
                res?.data?.data?.vehicles ||
                res?.data?.vehicles ||
                res?.data?.data ||
                [];

            if (!Array.isArray(data)) {
                throw new Error("Phản hồi không hợp lệ từ máy chủ.");
            }

            const myVehicles = data.filter(
                (v: any) => v.userId === user?.id
            );

            console.log("Xe của tôi:", myVehicles);
            setVehicles(myVehicles);
        } catch (err) {
            console.error(" Lỗi khi lấy danh sách xe:", err);
            // toast.error("Không thể tải danh sách xe!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchVehicles();
        }
    }, [user]);

    //  Mở modal xem chi tiết
    const handleViewDetails = (vehicles: Vehicle) => {
        setSelectedVehicle(vehicles);
        setOpen(true);
    };

    // 🗑️ Hủy liên kết (Xóa xe)
    const handleUnlinkVehicle = async (vehicleId: string) => {
        if (!vehicleId) return;
        if (!window.confirm("Bạn có chắc chắn muốn hủy liên kết (xóa) xe này không?")) return;

        try {
            const res = await api.delete(`/vehicles/${vehicleId}`, { withCredentials: true });

            if (res.data?.success) {
                toast.success(" Xe đã được xóa thành công!");
                setOpen(false);
                fetchVehicles();
            } else {
                toast.error("Không thể xóa xe! Vui lòng thử lại.");
            }
        } catch (err: any) {
            console.error(" Lỗi khi xóa xe:", err);
            if (err.response?.status === 404) {
                toast.error("Xe không tồn tại!");
            } else {
                toast.error("Đã xảy ra lỗi máy chủ khi xóa xe.");
            }
        }
    };


    return (
        <div className="flex h-screen bg-[#E9F8F8]">
            <main className="flex-1 p-8">
                <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
                    Danh sách xe của tôi
                </h1>

                {/* Loading */}
                {loading && (
                    <div className="text-center text-gray-500 mt-10 animate-pulse">
                        Đang tải danh sách xe...
                    </div>
                )}

                {/* Nếu chưa có xe */}
                {!loading && vehicles.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-16 text-center space-y-4">
                        <p className="text-gray-600 text-lg">Bạn chưa đăng ký xe nào.</p>

                        <Button
                            onClick={() => navigate("/home/register-vehicle")}
                            className="bg-[#38A3A5] hover:bg-[#2C8C8E] text-white px-6 py-3 text-lg rounded-xl shadow-md transition-all"
                        >
                            + Đăng ký xe ngay
                        </Button>
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
                                        {v.name}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Biển số: {v.licensePlates}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Model: {v.model?.name || "Không rõ"}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        Số khung (VIN): {v.VIN}
                                    </p>
                                    <p
                                        className={`text-sm font-medium ${v.status === "active"
                                            ? "text-green-600"
                                            : v.status === "pending"
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        Trạng thái:{" "}
                                        {v.status === "pending"
                                            ? "Đang chờ duyệt"
                                            : v.status === "active"
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
                                        Quản Lý
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
                                    <Label className="text-[#38A3A5]">Tên:</Label>
                                    <p>{selectedVehicle.name}</p>
                                </div>
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
                                            : selectedVehicle.status === "active"
                                                ? "Đã duyệt"
                                                : "Từ chối"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <Button
                                onClick={() => {
                                    console.log(
                                        "🟦 Cập nhật xe được chọn:",
                                        selectedVehicle?.id
                                    );
                                    if (selectedVehicle?.id) {
                                        navigate(`/home/update-vehicle/${selectedVehicle.id}`);
                                    } else {
                                        toast.error("Không tìm thấy thông tin xe để cập nhật.");
                                    }
                                }}
                                className="bg-[#38A3A5] hover:bg-[#2C8C8E] text-white"
                            >
                                Cập nhật
                            </Button>

                            <Button
                                onClick={() => handleUnlinkVehicle(selectedVehicle?.id!)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Hủy liên kết
                            </Button>
                        </div>

                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
