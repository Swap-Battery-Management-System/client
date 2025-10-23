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
            const res = await api.get("/stations", { withCredentials: true });
            const data = res.data?.data?.station || [];
            setStations(data);
            console.log("Danh sách trạm:", data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách trạm:", err);
            toast.error("Không thể lấy dữ liệu trạm!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    // Cập nhật trạng thái trạm
    const handleChangeStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(
                `/stations/${id}`,
                { status: newStatus },
                { withCredentials: true }
            );

            setStations((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
            );

            toast.success(`Đã cập nhật trạng thái trạm thành "${newStatus}"`);
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            toast.error("Không thể cập nhật trạng thái!");
        }
    };

    // Filter và search
    const filteredStations = stations.filter((s) => {
        const matchSearch =
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = filterStatus === "all" || s.status === filterStatus;

        return matchSearch && matchStatus;
    });

    return (
        <div className="flex h-screen bg-[#F8FBFB]">
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-semibold text-center text-[#2F8F9D] mb-6">
                    Quản lý trạm (Admin)
                </h1>

                {/* Search + Filter */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
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
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table trạm */}
                {loading && (
                    <div className="text-center text-gray-500 mt-10 animate-pulse">
                        Đang tải danh sách trạm...
                    </div>
                )}

                {!loading && stations.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        Chưa có trạm nào trong hệ thống.
                    </div>
                )}

                {!loading && stations.length > 0 && (
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full table-auto border-collapse border border-[#CDE8E5] bg-white shadow-md rounded-lg">
                            <thead className="bg-[#E6F7F7] text-[#2F8F9D]">
                                <tr>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">STT</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Tên trạm</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Địa chỉ</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Số slot</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Trạng thái</th>
                                    <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStations.map((s, index) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-all duration-150">
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{index + 1}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{s.name}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">{s.address}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-center">{s.slotCapacity}</td>
                                        <td className="border border-[#CDE8E5] px-3 py-2 text-left">
                                            <Select value={s.status} onValueChange={(val) => handleChangeStatus(s.id, val)}>
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder={s.status} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active" className="text-green-600">Active</SelectItem>
                                                    <SelectItem value="inactive" className="text-red-600">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="border border-[#CDE8E5] px-3 py-2">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                                    onClick={() => setSelectedStation(s)}
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

                {/* Modal xem chi tiết */}
                <Dialog open={!!selectedStation} onOpenChange={() => setSelectedStation(null)}>
                    <DialogContent className="max-w-md bg-white rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#2F8F9D] text-lg">
                                Chi tiết trạm
                            </DialogTitle>
                            <DialogDescription>
                                Thông tin chi tiết trạm được quản lý bởi admin
                            </DialogDescription>
                        </DialogHeader>

                        {selectedStation && (
                            <div className="space-y-3 mt-3">
                                <div>
                                    <Label className="text-[#2F8F9D]">Tên trạm:</Label>
                                    <p>{selectedStation.name}</p>
                                </div>
                                <div>
                                    <Label className="text-[#2F8F9D]">Địa chỉ:</Label>
                                    <p>{selectedStation.address}</p>
                                </div>
                                <div>
                                    <Label className="text-[#2F8F9D]">Số slot:</Label>
                                    <p>{selectedStation.slotCapacity}</p>
                                </div>
                                <div>
                                    <Label className="text-[#2F8F9D]">Trạng thái:</Label>
                                    <p>{selectedStation.status}</p>
                                </div>
                                <div>
                                    <Label className="text-[#2F8F9D]">Danh sách pin:</Label>
                                    <ul className="max-h-60 overflow-y-auto border p-2">
                                        {selectedStation.batteries.map((b) => (
                                            <li key={b.id} className="border-b py-1">
                                                {b.code} - SOC: {b.soc}% - Trạng Thái: {statusBattery[b.status] || b.status}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
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
