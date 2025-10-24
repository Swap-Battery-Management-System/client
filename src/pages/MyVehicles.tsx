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

    //  Hủy liên kết (Xóa xe)
    const handleUnlinkVehicle = async (vehicleId: string) => {
        if (!vehicleId) return;
        if (!window.confirm("Bạn có chắc chắn muốn hủy liên kết xe này không?")) return;

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
                <h1 className="text-4xl text-center font-bold mb-10 text-[#2C8C8E] tracking-wide">
                    Xe Của Tôi
                </h1>

                {loading && (
                    <div className="text-center text-gray-500 mt-10 animate-pulse">
                        Đang tải danh sách xe...
                    </div>
                )}

                {!loading && vehicles.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-16 space-y-4">
                        <p className="text-gray-600 text-lg">
                            Hiện bạn chưa có thông tin xe nào.
                        </p>
                        <Button
                            onClick={() => navigate("/home/register-vehicle")}
                            className="bg-[#38A3A5] hover:bg-[#2C8C8E] text-white px-8 py-3 text-lg rounded-xl shadow-lg"
                        >
                            + Thêm xe mới
                        </Button>
                    </div>
                )}

                {!loading && vehicles.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.map((v) => (
                            <Card
                                key={v.id}
                                className="group p-6 rounded-2xl border border-white/40 bg-white backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.04] text-center"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-[#2C8C8E] mb-4">
                                        {v.name}
                                    </h2>
                                    <p className="text-sm text-gray-700">
                                        Biển số: <strong>{v.licensePlates}</strong>
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        Model: {v.model?.name || "Không rõ"}
                                    </p>
                                    <p className="text-sm text-gray-700 truncate">
                                        VIN: {v.VIN}
                                    </p>

                                    <span
                                        className={`mt-4 px-3 py-1 text-xs rounded-full font-medium inline-block ${v.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : v.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {v.status === "pending"
                                            ? "Đang chờ duyệt"
                                            : v.status === "active"
                                                ? "Đã duyệt"
                                                : "Từ chối"}
                                    </span>
                                </div>

                                <div className="flex justify-center mt-5">
                                    <Button
                                        variant="outline"
                                        className="text-[#2C8C8E] border-[#2C8C8E] hover:bg-[#2C8C8E] hover:text-white transition-all rounded-lg"
                                        onClick={() => handleViewDetails(v)}
                                    >
                                        Quản lý
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-lg bg-white rounded-2xl p-6 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#2C8C8E] text-xl font-bold">
                                Chi tiết xe
                            </DialogTitle>
                            <DialogDescription className="text-gray-500">
                                Kiểm tra và quản lý thông tin xe của bạn
                            </DialogDescription>
                        </DialogHeader>

                        {selectedVehicle && (
                            <div className="mt-4">
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                                    <p>
                                        <Label className="text-[#2C8C8E]">Tên xe:</Label> {selectedVehicle.name}
                                    </p>
                                    <p>
                                        <Label className="text-[#2C8C8E]">Biển số:</Label> {selectedVehicle.licensePlates}
                                    </p>
                                    <p>
                                        <Label className="text-[#2C8C8E]">Model:</Label> {selectedVehicle.model?.name || "Không rõ"}
                                    </p>
                                    <p>
                                        <Label className="text-[#2C8C8E]">VIN:</Label> {selectedVehicle.VIN}
                                    </p>
                                    <p>
                                        <Label className="text-[#2C8C8E]">Trạng thái:</Label>{" "}
                                        {selectedVehicle.status === "pending"
                                            ? "Đang chờ duyệt"
                                            : selectedVehicle.status === "active"
                                                ? "Đã duyệt"
                                                : "Từ chối"}
                                    </p>
                                </div>

                                <div className="flex justify-between mt-6 gap-4">
                                    <Button
                                        onClick={() =>
                                            selectedVehicle?.id &&
                                            navigate(`/home/update-vehicle/${selectedVehicle.id}`)
                                        }
                                        className="bg-[#38A3A5] hover:bg-[#2C8C8E] text-white flex-1"
                                    >
                                        Cập nhật xe
                                    </Button>

                                    <Button
                                        onClick={() => handleUnlinkVehicle(selectedVehicle.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white flex-1"
                                    >
                                        Hủy liên kết
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}