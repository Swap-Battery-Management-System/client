"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FaSearch } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface BatteryType {
    id: string;
    name: string;
    designCapacity?: string;
    price?: string;
}

interface Model {
    id: string;
    name: string;
    brand?: string;
    batteryTypeId?: string;
    batteryType?: BatteryType;
}

interface Vehicle {
    id: string;
    licensePlates: string;
    VIN: string;
    status: "pending" | "active" | "invalid" | "inactive";
    modelId?: string;
    model?: Model;
    userId?: string;
    user?: User;
    validatedImage?: string;
    reason?: string;
}

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface VehicleResponse {
    status: "success" | "error";
    code: number;
    data: {
        vehicles: Vehicle[];
    };
}


export default function AdminVehicleManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [batteryTypes, setBatteryTypes] = useState<{ id: string; name: string }[]>([]);
    const [models, setModels] = useState<{ id: string; name: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterBattery, setFilterBattery] = useState("");
    const [filterModel, setFilterModel] = useState("");

    // Fetch tất cả dữ liệu cần thiết
    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch users và vehicles song song
            const [usersRes, vehiclesRes, batteryRes, modelsRes] = await Promise.all([
                api.get("/users", { withCredentials: true }),
                api.get("/vehicles", { withCredentials: true }),
                api.get("/battery-types", { withCredentials: true }),
                api.get("/models", { withCredentials: true }),
            ]);

            const usersData: User[] = usersRes?.data?.data?.users || [];
            const vehiclesData: Vehicle[] = vehiclesRes?.data?.data?.vehicles || [];
            const batteryData: BatteryType[] = batteryRes?.data?.data?.batteryTypes || [];
            const modelsData: Model[] = modelsRes?.data?.data || [];

            console.log("Users:", usersData);
            console.log("Vehicles:", vehiclesData);
            console.log("Battery types:", batteryData);
            console.log("Models:", modelsData);

            // Gán user và model vào vehicle
            const vehiclesWithUser = vehiclesData.map((v) => {
                const vehicleModel = v.modelId ? modelsData.find((m) => m.id === v.modelId) : undefined;
                const batteryType = vehicleModel?.batteryTypeId
                    ? batteryData.find((b) => b.id === vehicleModel.batteryTypeId)
                    : undefined;

                const vehicleWithDetails = {
                    ...v,
                    user: usersData.find((u) => u.id === v.userId),
                    model: vehicleModel ? { ...vehicleModel, batteryType } : undefined,
                };

                console.log("Processed vehicle:", vehicleWithDetails);
                return vehicleWithDetails;
            });

            setUsers(usersData);
            setVehicles(vehiclesWithUser);
            setBatteryTypes(batteryData);
            setModels(modelsData);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu:", err);
            toast.error("Lấy dữ liệu thất bại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    //  Mở modal xem chi tiết xe
    const handleViewDetails = (vehicles: Vehicle) => {
        console.log("Viewing vehicle:", vehicles);
        setSelectedVehicle(vehicles);
        setOpen(true);
    };

    //  Lọc xe theo từ khóa và trạng thái
    const filteredVehicles = vehicles.filter((v) => {
        const matchSearch =
          v.licensePlates
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase().trim()) ||
          v.model?.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          v.VIN?.toLowerCase().includes(searchTerm.toLowerCase().trim());

        const matchStatus =
            filterStatus === "" || v.status === filterStatus;

        const matchBattery =
            filterBattery === "" ||
            (v.model?.batteryType?.name === filterBattery);

        const matchModel = filterModel === "" || v.model?.name === filterModel;

        return matchSearch && matchStatus && matchBattery && matchModel;
    });

    //  Xóa xe
    const handleDeleteVehicle = async (id: string) => {
        if (!id) return toast.error("ID xe không hợp lệ!");

        // Hỏi xác nhận trước khi xóa
        if (!confirm("Bạn có chắc chắn muốn xóa xe này không?")) return;

        try {
            const res = await api.delete(`/vehicles/${id}`, { withCredentials: true });

            if (res.data?.status === "success") {
                setVehicles((prev) => prev.filter((v) => v.id !== id));
                toast.success("Đã xóa xe thành công!");
            } else {
                toast.error("Xóa xe thất bại!");
            }
        } catch (err: any) {
            console.error(err.response?.data || err);
            toast.error(err.response?.data?.message || "Không thể xóa xe!");
        }
    };

    // Cập nhật trạng thái
    const handleChangeStatus = async (
        id: string,
        newStatus: Vehicle["status"],
        reason?: string
    ) => {
        const vehicle = vehicles.find(v => v.id === id);
        if (!vehicle) return toast.error("Không tìm thấy xe!");
        if (vehicle.status === "inactive") {
            return toast.error("Xe đã ngừng hoạt động, không thể thay đổi trạng thái!");
        }

        try {
            console.log("Updating vehicle:", id, "to status:", newStatus, "reason:", reason);
            const res = await api.patch(
                `/vehicles/${id}`,
                { status: newStatus, reason },
                { withCredentials: true }
            );

            if (res.data?.status === "success") {
                setVehicles(prev =>
                    prev.map(v =>
                        v.id === id ? { ...v, status: newStatus, reason } : v
                    )
                );
                toast.success(
                    newStatus === "invalid"
                        ? "Xe đã bị từ chối!"
                        : `Đã cập nhật trạng thái xe thành "${newStatus}"`
                );
            } else {
                toast.error("Cập nhật thất bại!");
            }
        } catch (err: any) {
            console.error(err.response?.data || err);
            toast.error(err.response?.data?.message || "Không thể cập nhật trạng thái!");
        }
    };





    return (
        <div className="flex h-screen bg-[#F8FBFB]">
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-semibold text-center text-[#2F8F9D] mb-6">
                    Quản lý xe (Admin)
                </h1>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                    {/*  Ô tìm kiếm */}
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo biển số hoặc số khung..."
                            className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                        />
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/*  Bộ lọc trạng thái */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Đang chờ duyệt</option>
                        <option value="active">Đã duyệt</option>
                        <option value="invalid">Từ chối</option>
                    </select>

                    {/* Bộ lọc Model */}
                    <select
                        value={filterModel}
                        onChange={(e) => setFilterModel(e.target.value)}
                        className="border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                    >
                        <option value="">Tất cả model</option>
                        {models.map((m) => (
                            <option key={m.id} value={m.name}>
                                {m.name}
                            </option>
                        ))}
                    </select>

                    {/*  Bộ lọc loại Battery */}
                    <select
                        value={filterBattery}
                        onChange={(e) => setFilterBattery(e.target.value)}
                        className="border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                    >
                        <option value="">Tất cả loại pin</option>
                        {batteryTypes.map((b) => (
                            <option key={b.name} value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredVehicles.length}
                    </span>
                </div>


                {loading && (
                    <div className="text-center text-gray-500 mt-10 animate-pulse">
                        Đang tải danh sách xe...
                    </div>
                )}

                {!loading && vehicles.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        Chưa có xe nào trong hệ thống.
                    </div>
                )}

                {!loading && vehicles.length > 0 && (
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full table-auto border-collapse border border-[#CDE8E5] bg-white shadow-md rounded-lg">
                            <thead className="bg-[#E6F7F7] text-[#2F8F9D]">
                                <tr>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">STT</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Biển số</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Model</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Số Khung</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Loại Battery</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Trạng thái</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((v, index) => (
                                    <tr
                                        key={v.id}
                                        className="hover:bg-gray-50 transition-all duration-150 "
                                    >
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{index + 1}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{v.licensePlates}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{v.model?.name || "Không rõ"}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{v.VIN}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">
                                            {v.model?.batteryType?.name || "Không rõ"}
                                        </td>

                                        <td className="border border-[#CDE8E5] px-3 py-2 text-center">
                                            <span
                                                className={`
                                                inline-block px-3 py-1 rounded-full font-medium text-sm
                                                ${v.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : v.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : v.status === "invalid"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-200 text-gray-600"
                                                    }
                                           `}
                                            >
                                                {v.status === "active"
                                                    ? "Đã duyệt"
                                                    : v.status === "pending"
                                                        ? "Đang chờ duyệt"
                                                        : v.status === "invalid"
                                                            ? "Từ chối"
                                                            : "Ngừng hoạt động"}
                                            </span>
                                        </td>

                                        <td className="border border-[#CDE8E5] px-3 py-2">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                                    onClick={() => handleViewDetails(v)}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                                <Button
                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                    onClick={() => handleDeleteVehicle(v.id)}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Modal xem chi tiết */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-[#2F8F9D] text-lg">
                                Chi tiết xe
                            </DialogTitle>
                            <DialogDescription>
                                Thông tin chi tiết xe được quản lý bởi admin
                            </DialogDescription>
                        </DialogHeader>

                        {selectedVehicle && (
                            <>
                                <div className="flex justify-center mt-4">
                                    {selectedVehicle.validatedImage ? (
                                        <img
                                            src={selectedVehicle.validatedImage}
                                            alt="Validated Vehicle"
                                            className="w-full max-w-lg rounded-xl shadow-lg border border-gray-200"
                                        />
                                    ) : (
                                        <p className="text-gray-500 italic">Chưa có ảnh xác thực</p>
                                    )}
                                </div>
                                <div className="mt-4 flex flex-col md:flex-row gap-6">
                                    {/* Cột trái: Thông tin người dùng */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Label className="text-[#2F8F9D]">Người đăng ký:</Label>
                                            <p>{selectedVehicle.user?.fullName || "Chưa rõ"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[#2F8F9D]">Email:</Label>
                                            <p>{selectedVehicle.user?.email || "Chưa rõ"}</p>
                                        </div>
                                    </div>

                                    {/* Cột phải: Thông tin xe */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Label className="text-[#2F8F9D]">Biển số:</Label>
                                            <p>{selectedVehicle.licensePlates}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[#2F8F9D]">Model:</Label>
                                            <p>{selectedVehicle.model?.name || "Không rõ"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[#2F8F9D]">Số khung (VIN):</Label>
                                            <p>{selectedVehicle.VIN}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[#2F8F9D]">Loại Battery:</Label>
                                            <p>{selectedVehicle.model?.batteryType?.name || "Không rõ"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chọn trạng thái và nhập lý do */}
                                <div className="flex flex-col items-center mt-6 space-y-3">
                                    <Label className="text-[#2F8F9D]">Trạng thái:</Label>

                                    {["inactive", "active", "invalid"].includes(selectedVehicle.status) ? (
                                        <p className="text-gray-500 font-medium italic text-center">

                                            {selectedVehicle.status === "active"
                                                ? "Đã duyệt"
                                                : selectedVehicle.status === "invalid"
                                                    ? "Từ chối"
                                                    : "Ngừng hoạt động"}

                                        </p>
                                    ) : (
                                        <Select
                                            value={selectedVehicle.status}
                                            onValueChange={(value: "pending" | "active" | "invalid") => {
                                                setSelectedVehicle((prev) =>
                                                    prev ? { ...prev, status: value } : prev
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-[200px] text-center">
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending" className="text-yellow-600">
                                                    Đang chờ duyệt
                                                </SelectItem>
                                                <SelectItem value="active" className="text-green-600">
                                                    Duyệt
                                                </SelectItem>
                                                <SelectItem value="invalid" className="text-red-600">
                                                    Từ chối
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {selectedVehicle.status === "invalid" && (
                                        <div className="mt-3 w-full max-w-sm">
                                            <Label className="text-[#2F8F9D]">Lý do từ chối:</Label>
                                            <textarea
                                                className="mt-2 w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-[#2F8F9D] focus:outline-none"
                                                rows={3}
                                                placeholder="Nhập lý do từ chối..."
                                                value={selectedVehicle.reason || ""}
                                                onChange={(e) =>
                                                    setSelectedVehicle((prev) =>
                                                        prev ? { ...prev, reason: e.target.value } : prev
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>


                                {/* Nút hành động */}
                                <div className="flex justify-end mt-6 gap-3">
                                    <Button
                                        className="bg-gray-400 hover:bg-gray-500 text-white"
                                        onClick={() => setOpen(false)}
                                    >
                                        Đóng
                                    </Button>

                                    <Button
                                        className="bg-[#2F8F9D] hover:bg-[#267D89] text-white"
                                        onClick={async () => {
                                            if (!selectedVehicle) return;

                                            // Kiểm tra nhập lý do khi từ chối
                                            if (
                                                selectedVehicle.status === "invalid" &&
                                                !selectedVehicle.reason?.trim()
                                            ) {
                                                toast.error("Vui lòng nhập lý do từ chối!");
                                                return;
                                            }

                                            await handleChangeStatus(
                                                selectedVehicle.id,
                                                selectedVehicle.status,
                                                selectedVehicle.reason
                                            );

                                            setOpen(false);
                                        }}
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>


            </main>
        </div>
    );
}
