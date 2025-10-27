"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { FaSearch } from "react-icons/fa";
import { toast } from "sonner";
import api from "@/lib/api";

interface Battery {
    id: string;
    code: string;
    currentCapacity: string;
    manufacturedAt: string;
    cycleCount: number;
    soc: string;
    status: string;
    stationId: string;
    batteryTypeId: string;
}

interface Station {
    id: string;
    name: string;
    slotCapacity: number;
    address: string;
    latitude: string;
    longitude: string;
    status: string;
    avgRating: number | null;
    batteries: Battery[];
}

export default function AdminStationManagement() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const statusBattery: { [key: string]: string } = {
        available: "Có sẵn",
        in_charged: "Đang sạc",
        faulty: "Hỏng",
        reserved: "Đặt trước",
        in_use: "Đang sử dụng",
    };

    // Lấy danh sách trạm
    const fetchStations = async () => {
        try {
            setLoading(true);

            const res = await api.get<{ code: number; data: { stations: Station[] } }>("/stations", {
                withCredentials: true,
            });

            if (res.data?.code === 200 && res.data.data?.stations) {
                setStations(res.data.data.stations);
            } else {
                setStations([]);
                toast.error("Không có dữ liệu trạm hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi fetchStations:", error);
            toast.error("Không thể lấy dữ liệu trạm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    // Cập nhật thông tin trạm từ modal
    const handleUpdateStation = async () => {
        if (!selectedStation) return;

        try {
            const { id, name, address, slotCapacity, status } = selectedStation;
            await api.patch(
                `/stations/${id}`,
                { name, address, slotCapacity, status },
                { withCredentials: true }
            );

            setStations((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, name, address, slotCapacity, status } : s
                )
            );

            toast.success("Cập nhật thông tin trạm thành công");
            setSelectedStation(null);
        } catch {
            toast.error("Cập nhật thông tin trạm thất bại");
        }
    };

    // Lọc trạm theo tìm kiếm và trạng thái
    const filteredStations = stations.filter((s) => {
        const matchText =
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "all" || s.status === filterStatus;
        return matchText && matchStatus;
    });

    return (
        <div className="flex h-screen bg-[#F8FBFB]">
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-semibold text-center text-[#2F8F9D] mb-6">
                    Quản lý trạm (Admin)
                </h1>

                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative flex-1 min-w-[240px] max-w-sm">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên hoặc địa chỉ..."
                            className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                        />
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="active" className="text-green-600">
                                Active
                            </SelectItem>
                            <SelectItem value="inactive" className="text-red-600">
                                Inactive
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredStations.length}
                    </span>
                </div>

                {/* Loading */}
                {loading && (
                    <p className="text-center text-gray-500 mt-10 animate-pulse">
                        Đang tải dữ liệu...
                    </p>
                )}

                {/* Empty */}
                {!loading && stations.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">Không có trạm nào.</p>
                )}

                {/* Table */}
                {!loading && stations.length > 0 && (
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full table-auto border-collapse border border-[#CDE8E5] bg-white shadow-md">
                            <thead className="bg-[#E6F7F7] text-[#2F8F9D]">
                                <tr>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">
                                        STT
                                    </th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">
                                        Tên trạm
                                    </th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">
                                        Địa chỉ
                                    </th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">
                                        Số slot
                                    </th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">
                                        Trạng thái
                                    </th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStations.map((s, index) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="border px-3 py-2">{index + 1}</td>
                                        <td className="border px-3 py-2">{s.name}</td>
                                        <td className="border px-3 py-2">{s.address}</td>
                                        <td className="border px-3 py-2 text-center">{s.slotCapacity}</td>
                                        <td className="border px-3 py-2 text-center">
                                            <span
                                                className={`font-medium ${s.status === "active"
                                                    ? "text-green-600"
                                                    : s.status === "inactive"
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                    }`}
                                            >
                                                {s.status === "active"
                                                    ? "Active"
                                                    : s.status === "inactive"
                                                        ? "Inactive"
                                                        : s.status}
                                            </span>
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            <Button
                                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                                onClick={() => setSelectedStation(s)}
                                            >
                                                Quản lý
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal quản lý */}
                <Dialog open={!!selectedStation} onOpenChange={() => setSelectedStation(null)}>
                    <DialogContent className="max-w-lg bg-white rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#2F8F9D]">Quản lý trạm</DialogTitle>
                            <DialogDescription>Chỉnh sửa thông tin trạm bởi Admin</DialogDescription>
                        </DialogHeader>

                        {selectedStation && (
                            <div className="space-y-3 mt-3">
                                <div>
                                    <Label className="text-[#2F8F9D] font-medium">Tên trạm</Label>
                                    <input
                                        type="text"
                                        value={selectedStation.name}
                                        onChange={(e) =>
                                            setSelectedStation({ ...selectedStation, name: e.target.value })
                                        }
                                        className="border rounded w-full px-2 py-1 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="text-[#2F8F9D] font-medium">Địa chỉ</Label>
                                    <input
                                        type="text"
                                        value={selectedStation.address}
                                        onChange={(e) =>
                                            setSelectedStation({ ...selectedStation, address: e.target.value })
                                        }
                                        className="border rounded w-full px-2 py-1 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="text-[#2F8F9D] font-medium">Số slot</Label>
                                    <input
                                        type="number"
                                        value={selectedStation.slotCapacity}
                                        onChange={(e) =>
                                            setSelectedStation({
                                                ...selectedStation,
                                                slotCapacity: Number(e.target.value),
                                            })
                                        }
                                        className="border rounded w-full px-2 py-1 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="text-[#2F8F9D] font-medium">Trạng thái</Label>
                                    <Select
                                        value={selectedStation.status}
                                        onValueChange={(val) =>
                                            setSelectedStation({ ...selectedStation, status: val })
                                        }
                                    >
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-[#2F8F9D] font-medium">Pin tại trạm:</Label>
                                    <ul className="max-h-56 overflow-y-auto border rounded p-2 mt-1">
                                        {selectedStation.batteries.length > 0 ? (
                                            selectedStation.batteries.map((b) => (
                                                <li key={b.id} className="border-b py-1 text-sm">
                                                    {b.code} | SOC: {b.soc}% | {statusBattery[b.status] || b.status}
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">Không có dữ liệu pin.</p>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Nút Lưu / Đóng */}
                        <div className="flex justify-end pt-4 gap-2">
                            <Button
                                onClick={handleUpdateStation}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                Lưu
                            </Button>
                            <Button
                                onClick={() => setSelectedStation(null)}
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
