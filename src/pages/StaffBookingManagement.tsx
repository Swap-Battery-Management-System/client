"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { FaSearch } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";


interface Booking {
    id: string;
    scheduleTime: string;
    note?: string;
    status: "scheduled" | "in_progress" | "completed" | "canceled" | "missed";
    userId: string;
    vehicleId: string;
    batteryId: string;
    stationId: string;
    createdAt: string;
    updatedAt?: string | null;
}

interface Vehicle {
    id: string;
    name: string;
    licensePlates: string;
    VIN?: string;
    status?: string;
    modelId?: string;
    userId?: string;
    batteryId?: string | null;
    batteryType?: string;
    model?: {
        id: string;
        name: string;
        brand: string;
        batteryTypeId: string;
        batteryType?: {
            id: string;
            name: string;
            designCapacity?: string;
            price?: string;
        }
    }
}

interface Battery {
    id: string;
    code: string;
    currentCapacity?: string;
    manufacturedAt?: string;
    cycleCount?: number;
    soc?: string;
    status?: string;
    stationId?: string;
    batteryTypeId?: string;

}


interface Station {
    id: string;
    name: string;
    address: string;
    status: string;
    slotCapacity?: number;
    bookings?: Booking[];
    batteries?: Battery[];
}

const bookingStatusMap = {
    scheduled: { label: "Đã đặt", textColor: "text-yellow-700", bgColor: "bg-yellow-100", boldColor: "text-yellow-800" },
    in_progress: { label: "Đang đổi pin", textColor: "text-blue-700", bgColor: "bg-blue-100", boldColor: "text-blue-800" },
    completed: { label: "Hoàn thành", textColor: "text-green-700", bgColor: "bg-green-100", boldColor: "text-green-800" },
    canceled: { label: "Hủy lịch", textColor: "text-orange-700", bgColor: "bg-orange-100", boldColor: "text-orange-800" },
    missed: { label: "Quá hạn", textColor: "text-red-700", bgColor: "bg-red-100", boldColor: "text-red-800" }
};

export default function StaffBookingManagement() {
    const { user } = useAuth();
    const [station, setStation] = useState<Station | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
    const [batteriesMap, setBatteriesMap] = useState<Map<string, string>>(new Map());
    const [vehiclesMap, setVehiclesMap] = useState<Map<string, Vehicle>>(new Map());
    const [loading, setLoading] = useState(true);

    const [searchCode, setSearchCode] = useState("");
    const [filterStatus, setFilterStatus] = useState<Booking["status"] | "all">("all");

    const getStatusText = (status: Booking["status"]) => bookingStatusMap[status]?.label || "Không xác định";
    const getStatusClass = (status: Booking["status"]) => bookingStatusMap[status]?.textColor || "text-gray-600";

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate=useNavigate();

    const handleStatusClick = (status: Booking["status"]) => {
        setFilterStatus(prev => (prev === status ? "all" : status));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 🔹 Lấy danh sách trạm
                const res = await api.get("/stations", { withCredentials: true });
                const myStation: Station | undefined = res.data.data.stations;

                if (!myStation) {
                    toast.error("Không tìm thấy trạm của staff!");
                    setStation(null);
                    setBookings([]);
                    return;
                }

                console.log("Trạm của staff:", myStation);
                setStation(myStation);

                // 🔹 Lấy danh sách pin tại trạm
                if (Array.isArray(myStation.batteries)) {
                    const map = new Map<string, string>();
                    myStation.batteries.forEach(b => {
                        if (b.id && b.code) map.set(b.id, b.code);
                    });
                    setBatteriesMap(map);
                    console.log("Battery map:", map);
                } else {
                    // Nếu API không trả kèm batteries, gọi riêng endpoint /batteries
                    try {
                        const batteryRes = await api.get("/batteries", { withCredentials: true });
                        const allBatteries: Battery[] = batteryRes.data?.data?.batteries ?? [];
                        const map = new Map<string, string>();
                        allBatteries.forEach(b => {
                            if (b.id && b.code) map.set(b.id, b.code);
                        });
                        setBatteriesMap(map);
                        console.log("Battery map (from /batteries):", map);
                    } catch (err) {
                        console.warn("Không thể lấy danh sách pin:", err);
                    }
                }

                // 🔹 Lấy danh sách booking của trạm
                let stationBookings: Booking[] = Array.isArray(myStation.bookings)
                    ? myStation.bookings
                    : [];

                if (!stationBookings.length) {
                    const bookingRes = await api.get("/bookings", { withCredentials: true });
                    const allBookings: Booking[] = bookingRes.data?.data?.bookings ?? [];
                    stationBookings = allBookings.filter(b => b.stationId === myStation.id);
                }

                console.log("Bookings của trạm:", stationBookings);
                setBookings(stationBookings);

                // 🔹 Fetch thông tin user theo ID (an toàn hơn)
                const userIds = Array.from(new Set(stationBookings.map(b => b.userId)));
                const userMap = new Map<string, string>();

                for (const id of userIds) {
                    try {
                        const userRes = await api.get(`/users/${id}`, { withCredentials: true });
                        const user = userRes.data?.data?.user;
                        if (user) {
                            userMap.set(id, user.email || "Không có email");
                        }
                    } catch (err: any) {
                        console.warn(`Không thể lấy user ${id}:`, err.response?.status);
                    }
                }

                setUsersMap(userMap);
                console.log("User map:", userMap);

                // 🔹 Fetch thông tin vehicle theo ID
                const vehicleIds = Array.from(new Set(stationBookings.map(b => b.vehicleId)));
                const vehicleMap = new Map<string, Vehicle>();

                for (const id of vehicleIds) {
                    try {
                        const vehicleRes = await api.get(`/vehicles/${id}`, { withCredentials: true });
                        const vehicle = vehicleRes.data?.data?.vehicle;
                        if (vehicle) {
                            vehicleMap.set(id, vehicle);
                        }
                    } catch (err: any) {
                        console.warn(`Không thể lấy vehicle ${id}:`, err.response?.status);
                    }
                }
                setVehiclesMap(vehicleMap);

            } catch (error: any) {
                console.error("Lỗi fetch dữ liệu booking:", error);
                toast.error("Không thể tải dữ liệu booking!");
                setStation(null);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredBookings = bookings.filter(b => {
        const search = searchCode.replace(/\s+/g, "").toLowerCase();
        const codeNormalized = b.id.replace(/\s+/g, "").toLowerCase();
        const userEmail = usersMap.get(b.userId)?.toLowerCase() || "";
        const matchesSearch =
            codeNormalized.includes(search) || userEmail.includes(search);
        const matchesStatus = filterStatus === "all" || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleCheckin = async (bookingId: string) => {
        navigate(`/staff/swap-battery-process/${bookingId}`);
    };

    return (
        <div className="p-8 bg-[#E9F8F8] min-h-screen">
            <h1 className="text-4xl text-center font-bold mb-10 text-[#2C8C8E]">
                Quản Lý Booking Tại Trạm
            </h1>

            {loading && <p className="text-center text-gray-500">Đang tải...</p>}

            {!loading && !station && (
                <p className="text-center text-red-500 font-semibold">
                    Không tìm thấy trạm của staff.
                </p>
            )}

            {!loading && station && (
                <>
                    {/* 🔹 Thẻ tổng quan booking */}
                    <Card className="p-6 mb-10 shadow-lg bg-white text-center border border-gray-200">
                        <h2 className="text-2xl font-bold text-[#007577]">Tổng quan booking</h2>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-6 text-sm font-medium">
                            {Object.keys(bookingStatusMap).map(key => {
                                const k = key as Booking["status"];
                                return (
                                    <div
                                        key={k}
                                        className={`${bookingStatusMap[k].bgColor} p-3 rounded-lg cursor-pointer hover:opacity-80`}
                                        onClick={() => handleStatusClick(k)}
                                    >
                                        <p className={bookingStatusMap[k].textColor}>
                                            {bookingStatusMap[k].label}
                                        </p>
                                        <p
                                            className={`font-bold text-lg ${bookingStatusMap[k].boldColor}`}
                                        >
                                            {bookings.filter(b => b.status === k).length}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-gray-900 font-bold">
                            📦 Tổng số booking: {bookings.length}
                        </p>
                    </Card>

                    {/* 🔹 Bộ lọc và tìm kiếm */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                        <div className="relative flex-1 min-w-[220px] max-w-sm">
                            <input
                                type="text"
                                value={searchCode}
                                onChange={e => setSearchCode(e.target.value)}
                                placeholder="Tìm theo mã booking..."
                                className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                            />
                            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={e =>
                                setFilterStatus(e.target.value as Booking["status"] | "all")
                            }
                            className="border border-gray-300 rounded p-2 text-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {Object.keys(bookingStatusMap).map(key => (
                                <option key={key} value={key}>
                                    {bookingStatusMap[key as Booking["status"]].label}
                                </option>
                            ))}
                        </select>

                        <span className="ml-auto font-semibold text-sm">
                            Số lượng: {filteredBookings.length}
                        </span>
                    </div>

                    {/* 🔹 Bảng danh sách booking */}
                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="min-w-full bg-white">
                            <thead className="bg-[#2C8C8E] text-white">
                                <tr>
                                    <th className="py-3 px-4 text-left">Mã Booking</th>
                                    <th className="py-3 px-4 text-left">Code Pin</th>
                                    <th className="py-3 px-4 text-left">Email người đặt</th>
                                    <th className="py-3 px-4 text-left">Biển Số Xe</th>
                                    <th className="py-3 px-4 text-left">Thời gian</th>
                                    <th className="py-3 px-4 text-left">Trạng thái</th>
                                    <th className="py-3 px-4 text-left">Ghi chú</th>
                                    <th className="py-3 px-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(b => {
                                    const vehicle = vehiclesMap.get(b.vehicleId);
                                    return (
                                        <tr key={b.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-semibold">{b.id?.slice(0, 8)}</td>
                                            <td className="py-3 px-4">{batteriesMap.get(b.batteryId) || "—"}</td>
                                            <td className="py-3 px-4">{usersMap.get(b.userId) || "—"}</td>
                                            <td className="py-3 px-4">{vehicle?.licensePlates || "—"}</td>
                                            <td className="py-3 px-4">
                                                {new Date(b.scheduleTime).toLocaleString("vi-VN")}
                                            </td>
                                            <td className={`py-3 px-4 font-semibold ${getStatusClass(b.status)}`}>
                                                {getStatusText(b.status)}
                                            </td>
                                            <td className="py-3 px-4">{b.note || "-"}</td>
                                            <td className="py-3 px-4 text-center flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedBooking(b);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    Xem chi tiết
                                                </Button>

                                                {b.status === "scheduled" && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-600 text-white hover:bg-green-700"
                                                        onClick={() => handleCheckin(b.id)}
                                                    >
                                                        Check-in
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>

                    {/* 🔹 Modal xem chi tiết booking */}
                    {selectedBooking && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogContent className="max-w-md rounded-xl p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-[#007577]">
                                        Chi tiết đặt lịch
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-500">
                                        Thông tin cụ thể về lượt đặt này
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-2 text-sm mt-3">
                                    <p>
                                        <strong>Mã đặt lịch:</strong> {selectedBooking.id}
                                    </p>
                                    <p>
                                        <strong>Tên người đặt:</strong>{" "}
                                        {usersMap.get(selectedBooking.userId) || "—"}
                                    </p>
                                    <p><strong>Tên xe:</strong> {vehiclesMap.get(selectedBooking.vehicleId)?.name || "—"}</p>
                                    <p><strong>Biển số:</strong> {vehiclesMap.get(selectedBooking.vehicleId)?.licensePlates || "—"}</p>
                                    <p>
                                        <strong>Mã pin:</strong>{" "}
                                        {batteriesMap.get(selectedBooking.batteryId) || "—"}
                                    </p>
                                    <p>
                                        <strong>Thời gian:</strong>{" "}
                                        {selectedBooking.scheduleTime
                                            ? new Date(selectedBooking.scheduleTime).toLocaleString(
                                                "vi-VN"
                                            )
                                            : "Chưa có"}
                                    </p>
                                    <p>
                                        <strong>Trạng thái:</strong>{" "}
                                        <span
                                            className={
                                                selectedBooking.status === "scheduled"
                                                    ? "text-yellow-700"
                                                    : selectedBooking.status === "in_progress"
                                                        ? "text-blue-600"
                                                        : selectedBooking.status === "completed"
                                                            ? "text-green-600"
                                                            : selectedBooking.status === "canceled"
                                                                ? "text-orange-500"
                                                                : "text-red-600"
                                            }
                                        >
                                            {bookingStatusMap[selectedBooking.status]?.label}
                                        </span>
                                    </p>
                                    {selectedBooking.note && (
                                        <p>
                                            <strong>Ghi chú:</strong> {selectedBooking.note}
                                        </p>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </>
            )}
        </div>
    );

}
