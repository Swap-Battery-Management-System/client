"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { FaSearch } from "react-icons/fa";
import { Card } from "@/components/ui/card";

interface Booking {
    id: string;
    scheduleTime: string;
    note?: string;
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    userId: string;
    vehicleId: string;
    batteryId: string;
    stationId: string;
    createdAt: string;
    updatedAt?: string | null;
}

interface BookingHistoryItem {
    id: string;
    customerName: string;
    station: string;
    vehicleName: string;
    licensePlates: string;
    batteryType: string;
    scheduleTime: string;
    note?: string;
    status: "Đang tiến hành" | "Đã hoàn thành" | "Hủy đặt lịch" | "Quá hạn";
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

interface Station {
    id: string;
    name: string;
    address: string;
    status: string;
    slotCapacity?: number;
    bookings?: Booking[];
}

const bookingStatusMap = {
    scheduled: { label: "Đã đặt", textColor: "text-yellow-700", bgColor: "bg-yellow-100", boldColor: "text-yellow-800" },
    in_progress: { label: "Đang diễn ra", textColor: "text-blue-700", bgColor: "bg-blue-100", boldColor: "text-blue-800" },
    completed: { label: "Hoàn thành", textColor: "text-green-700", bgColor: "bg-green-100", boldColor: "text-green-800" },
    cancelled: { label: "Hủy", textColor: "text-red-700", bgColor: "bg-red-100", boldColor: "text-red-800" },
};

export default function StaffBookingManagement() {
    const { user } = useAuth();
    const [station, setStation] = useState<Station | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchCode, setSearchCode] = useState("");
    const [filterStatus, setFilterStatus] = useState<Booking["status"] | "all">("all");

    const getStatusText = (status: Booking["status"]) => bookingStatusMap[status]?.label || "Không xác định";
    const getStatusClass = (status: Booking["status"]) => bookingStatusMap[status]?.textColor || "text-gray-600";

    const handleStatusClick = (status: Booking["status"]) => {
        setFilterStatus(prev => (prev === status ? "all" : status));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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

                // Nếu trạm có sẵn bookings dùng luôn, nếu không fallback gọi API /bookings
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
        const matchesSearch = codeNormalized.includes(search);
        const matchesStatus = filterStatus === "all" || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 bg-[#E9F8F8] min-h-screen">
            <h1 className="text-4xl text-center font-bold mb-10 text-[#2C8C8E]">Quản Lý Booking Tại Trạm</h1>

            {loading && <p className="text-center text-gray-500">Đang tải...</p>}

            {!loading && !station && (
                <p className="text-center text-red-500 font-semibold">Không tìm thấy trạm của staff.</p>
            )}

            {!loading && station && (
                <>
                    <Card className="p-6 mb-10 shadow-lg bg-white text-center border border-gray-200">
                        <h2 className="text-2xl font-bold text-[#007577]">Tổng quan booking</h2>

                        {/* Grid tổng quan booking theo trạng thái */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6 text-sm font-medium">
                            {Object.keys(bookingStatusMap).map(key => {
                                const k = key as Booking["status"];
                                return (
                                    <div
                                        key={k}
                                        className={`${bookingStatusMap[k].bgColor} p-3 rounded-lg cursor-pointer hover:opacity-80`}
                                        onClick={() => handleStatusClick(k)}
                                    >
                                        <p className={bookingStatusMap[k].textColor}>{bookingStatusMap[k].label}</p>
                                        <p className={`font-bold text-lg ${bookingStatusMap[k].boldColor}`}>
                                            {bookings.filter(b => b.status === k).length}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tổng số booking */}
                        <p className="mt-4 text-gray-900 font-bold">📦 Tổng số booking: {bookings.length}</p>
                    </Card>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                        <div className="relative flex-1 min-w-[220px] max-w-sm">
                            <input
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder="Tìm theo mã booking..."
                                className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                            />
                            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as Booking["status"] | "all")}
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

                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="min-w-full bg-white">
                            <thead className="bg-[#2C8C8E] text-white">
                                <tr>
                                    <th className="py-3 px-4 text-left">Mã Booking</th>
                                    <th className="py-3 px-4 text-left">Thời gian</th>
                                    <th className="py-3 px-4 text-left">Trạng thái</th>
                                    <th className="py-3 px-4 text-left">Ghi chú</th>
                                    <th className="py-3 px-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(b => (
                                    <tr key={b.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-semibold">{b.id}</td>
                                        <td className="py-3 px-4">{new Date(b.scheduleTime).toLocaleString()}</td>
                                        <td className={`py-3 px-4 font-semibold ${getStatusClass(b.status)}`}>
                                            {getStatusText(b.status)}
                                        </td>
                                        <td className="py-3 px-4">{b.note || "-"}</td>
                                        <td className="py-3 px-4 text-center">
                                            <Button variant="outline" size="sm">Xem chi tiết</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
