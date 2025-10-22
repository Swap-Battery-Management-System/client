"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Vehicle {
    id: string;
    licensePlates: string;
    VIN: string;
    status: string;
    createdAt: string;
    model?: {
        id: string;
        name: string;
        manufacturer?: string;
        batteryType?: {
            name: string;
            designCapacity?: string;
            price?: string;
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
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterBattery, setFilterBattery] = useState("");

    // Lấy toàn bộ danh sách xe trong hệ thống
    const fetchAllVehicles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Bạn cần đăng nhập với tư cách admin!");
                return;
            }

            const res = await api.get("/vehicles", {
                withCredentials: true
            });

            console.log(" Tất cả xe:", res.data);

            const data =
                res?.data?.data?.vehicle ||
                res?.data?.vehicle ||
                res?.data?.data ||
                [];

            if (!Array.isArray(data)) {
                throw new Error("Phản hồi không hợp lệ.");
            }

            setVehicles(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách xe:", err);
            toast.error("Không thể tải danh sách xe!");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAllVehicles();
    }, []);

    //  Mở modal xem chi tiết xe
    const handleViewDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setOpen(true);
    };

    //  Duyệt xe
    const handleApprove = async (id: string) => {
        try {
            const res = await api.patch(
                `/vehicles/${id}`,
                { status: "active" },
                { withCredentials: true }
            );

            console.log(" Phản hồi duyệt xe:", res.data);
            toast.success("Xe đã được duyệt!");
            fetchAllVehicles();
        } catch (err) {
            console.error(" Lỗi duyệt xe:", err);
            toast.error("Không thể duyệt xe!");
        }
    };

    //  Lọc xe theo từ khóa và trạng thái
    const filteredVehicles = vehicles.filter((v) => {
        const matchSearch =
            v.licensePlates?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.VIN?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus =
            filterStatus === "" || v.status === filterStatus;

        const matchBattery =
            filterBattery === "" ||
            (v.model?.batteryType?.name === filterBattery);

        return matchSearch && matchStatus && matchBattery;
    });


    //  Từ chối xe
    const handleReject = async (id: string) => {
        try {
            const res = await api.patch(
                `/vehicles/${id}`,
                { status: "inactive" },
                { withCredentials: true }
            );

            console.log(" Phản hồi từ chối xe:", res.data);
            toast.success("Xe đã bị từ chối!");
            fetchAllVehicles();
        } catch (err) {
            console.error(" Lỗi từ chối xe:", err);
            toast.error("Không thể từ chối xe!");
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
                        <option value="inactive">Từ chối</option>
                    </select>

                    {/*  Bộ lọc loại Battery */}
                    <select
                        value={filterBattery}
                        onChange={(e) => setFilterBattery(e.target.value)}
                        className="border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                    >
                        <option value="">Tất cả loại pin</option>
                        <option value="LiFePO4 72V 30Ah">LiFePO4 72V 30Ah</option>
                        <option value="Lithium-ion 60V 20Ah">Lithium-ion 60V 20Ah</option>
                    </select>
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
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Chủ xe</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Trạng thái</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((v, index) => (
                                    <tr
                                        key={v.id}
                                        className="hover:bg-gray-50 transition-all duration-150 text-left"
                                    >
                                        <td className="border border-[#CDE8E5] px-3 py-2">{index + 1}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">{v.licensePlates}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">{v.model?.name || "Không rõ"}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">{v.VIN}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">
                                            {v.model?.batteryType?.name || "Không rõ"}
                                        </td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">
                                            {v.user?.fullName || "Không rõ"}
                                        </td>
                                        <td
                                            className={`border border-[#CDE8E5] px-3 py-2 font-medium ${v.status === "active"
                                                ? "text-green-600"
                                                : v.status === "pending"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {v.status === "pending"
                                                ? "Đang chờ duyệt"
                                                : v.status === "active"
                                                    ? "Đã duyệt"
                                                    : "Từ chối"}
                                        </td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">
                                            <div className="flex justify-center gap-2">
                                                {v.status === "pending" && (
                                                    <>
                                                        <Button
                                                            className="bg-green-500 hover:bg-green-600 text-white"
                                                            onClick={() => handleApprove(v.id)}
                                                        >
                                                            Duyệt
                                                        </Button>
                                                        <Button
                                                            className="bg-red-500 hover:bg-red-600 text-white"
                                                            onClick={() => handleReject(v.id)}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    className="text-[#2F8F9D] border-[#2F8F9D] hover:bg-[#2F8F9D] hover:text-white"
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


                {/* 📄 Modal xem chi tiết */}
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
                                    <Label className="text-[#2F8F9D]">Chủ xe:</Label>
                                    <p>{selectedVehicle.user?.fullName || "Không rõ"}</p>
                                </div>
                                <div>
                                    <Label className="text-[#2F8F9D]">Email:</Label>
                                    <p>{selectedVehicle.user?.email || "Không rõ"}</p>
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
                                    <p>{selectedVehicle.model?.batteryType?.name}</p>
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
                                <div>
                                    <Label className="text-[#2F8F9D]">Ngày tạo:</Label>
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
