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

interface Vehicle {
    id: string;
    licensePlates: string;
    name: string;
    VIN: string;
    status: string;
    model?: {
        id: string;
        name: string;
        batteryType?: {
            name: string;
            designCapacity?: string;
        };
    };
    user?: {
        id: string;
        fullName: string;
        email: string;
    };
}

export default function AdminVehicleManagement() {
    const { user } = useAuth();
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

    // Lấy toàn bộ danh sách xe trong hệ thống
    const fetchAllVehicles = async () => {
        try {
            setLoading(true);

            const res = await api.get("/vehicles", {
                withCredentials: true
            });

            const data =
                res?.data?.data?.vehicles ||
                res?.data?.vehicles ||
                res?.data?.data ||
                [];

                console.log("vehicle",res.data);
            if (!Array.isArray(data)) {
                throw new Error("Phản hồi không hợp lệ.");
            }

            setVehicles(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách xe:", err);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách loại pin
    const fetchBatteryTypes = async () => {
        try {
            const res = await api.get("/battery-types", { withCredentials: true });
            const types = res.data?.data?.batteryTypes || [];
            setBatteryTypes(types);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách pin:", err);
        }
    };

    const fetchModels = async () => {
        try {
            const res = await api.get("/models", { withCredentials: true });
            const data = res.data?.data || [];
            setModels(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách model:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchAllVehicles(), fetchBatteryTypes(), fetchModels()]);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //  Mở modal xem chi tiết xe
    const handleViewDetails = (vehicles: Vehicle) => {
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

    // Cập nhật trạng thái xe
    const handleChangeStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(
                `/vehicles/${id}`,
                { status: newStatus },
                { withCredentials: true }
            );

            // Cập nhật local state ngay lập tức
            setVehicles(prev =>
                prev.map(v =>
                    v.id === id ? { ...v, status: newStatus } : v
                )
            );

            toast.success(`Đã cập nhật trạng thái xe thành "${newStatus}"`);
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            toast.error("Không thể cập nhật trạng thái!");
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

                                        <td className="border border-[#CDE8E5] px-3 py-2 ">
                                            <Select
                                                value={v.status}
                                                onValueChange={(value) => handleChangeStatus(v.id, value)}
                                            >
                                                <SelectTrigger className="w-[150px] mx-auto">
                                                    <span
                                                        className={`font-medium ${v.status === "active"
                                                            ? "text-green-600"
                                                            : v.status === "pending"
                                                                ? "text-yellow-600"
                                                                : v.status === "inactive"
                                                                    ? "text-red-600"
                                                                    : "text-gray-600"
                                                            }`}
                                                    >
                                                        {v.status === "active"
                                                            ? "Đã duyệt"
                                                            : v.status === "pending"
                                                                ? "Đang chờ duyệt"
                                                                : v.status === "invalid"
                                                                    ? "Từ chối"
                                                                    : "Không rõ"}
                                                    </span>
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="pending" className="text-yellow-600">
                                                        Đang chờ duyệt
                                                    </SelectItem>
                                                    <SelectItem value="active" className="text-green-600">
                                                        Đã duyệt
                                                    </SelectItem>
                                                    <SelectItem value="invalid" className="text-red-600">
                                                        Từ chối
                                                    </SelectItem>
                                                </SelectContent><SelectContent>
                                                    {v.status === "pending" && (
                                                        <>
                                                            <SelectItem value="pending" className="text-yellow-600">
                                                                Đang chờ duyệt
                                                            </SelectItem>
                                                            <SelectItem value="active" className="text-green-600">
                                                                Đã duyệt
                                                            </SelectItem>
                                                            <SelectItem value="invalid" className="text-red-600">
                                                                Từ chối
                                                            </SelectItem>
                                                        </>
                                                    )}

                                                    {v.status === "active" && (
                                                        <>
                                                            <SelectItem value="active" className="text-green-600">
                                                                Đã duyệt
                                                            </SelectItem>
                                                            <SelectItem value="invalid" className="text-red-600">
                                                                Từ chối
                                                            </SelectItem>
                                                        </>
                                                    )}

                                                    {v.status === "inactive" && (
                                                        <>
                                                            <SelectItem value="active" className="text-green-600">
                                                                Đã duyệt
                                                            </SelectItem>
                                                            <SelectItem value="invalid" className="text-red-600">
                                                                Từ chối
                                                            </SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>

                                            </Select>
                                        </td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                                    onClick={() => handleViewDetails(v)}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/*  Modal xem chi tiết */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-md bg-white rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#2F8F9D] text-lg">
                                Chi tiết xe
                            </DialogTitle>
                            <DialogDescription>
                                Thông tin chi tiết xe được quản lý bởi admin
                            </DialogDescription>
                        </DialogHeader>

                        {selectedVehicle && (
                            <div className="space-y-3 mt-3">
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
                                <div>
                                    <Label className="text-[#2F8F9D]">Trạng thái:</Label>
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

                        <div className="flex justify-end mt-6">
                            <Button
                                onClick={() => setOpen(false)}
                                className="bg-[#2F8F9D] hover:bg-[#267D89] text-white"
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
