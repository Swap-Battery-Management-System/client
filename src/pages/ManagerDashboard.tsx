"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw, MapPin } from "lucide-react";
import api from "@/lib/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface Booking {
    id: string;
    scheduleTime: string;
    status: string;
    [key: string]: any;
}

interface Station {
    id: string;
    name: string;
    status: "active" | "inactive";
    latitude: number;
    longitude: number;
    address?: string;
}

export default function ManagerDashboard() {
    const [station, setStation] = useState<Station | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingView, setBookingView] = useState<"day" | "month" | "year">("day");
    const [bookingData, setBookingData] = useState<{ name: string; bookings: number }[]>([]);

    // ==================== Fetch Station ====================
    const fetchStation = async () => {
        try {
            setLoading(true);
            const res = await api.get("/stations", { withCredentials: true });
            const apiStation = res.data?.data?.stations;
            if (apiStation) {
                const sData = Array.isArray(apiStation) ? apiStation[0] : apiStation;
                setStation(sData);
            } else {
                toast.info("Bạn chưa được gán vào trạm nào.");
            }
        } catch (err) {
            console.error("Failed to load station:", err);
            toast.error("Không thể tải thông tin trạm");
        } finally {
            setLoading(false);
        }
    };

    // ==================== Fetch Bookings ====================
    const fetchBookings = async () => {
        if (!station) return;
        try {
            const res = await api.get(`/bookings?stationId=${station.id}`, { withCredentials: true });
            setBookings(res.data?.data?.bookings || []);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            toast.error("Không thể tải dữ liệu đặt chỗ");
        }
    };

    // ==================== Booking Stats ====================
    const fetchBookingStats = (range: "day" | "month" | "year") => {
        if (!bookings.length) {
            setBookingData([]);
            return;
        }

        const counts: Record<string, number> = {};
        bookings.forEach((b) => {
            if (!b.scheduleTime) return;
            const date = dayjs.utc(b.scheduleTime);
            if (!date.isValid()) return;

            let key = "";
            switch (range) {
                case "day": key = date.format("DD/MM/YYYY"); break;
                case "month": key = date.format("MM/YYYY"); break;
                case "year": key = date.format("YYYY"); break;
            }
            counts[key] = (counts[key] || 0) + 1;
        });

        const sortedKeys = Object.keys(counts).sort((a, b) => {
            const da = dayjs.utc(a.split('/').reverse().join('-'));
            const db = dayjs.utc(b.split('/').reverse().join('-'));
            return da.valueOf() - db.valueOf();
        });

        const result = sortedKeys.map((key) => ({ name: key, bookings: counts[key] }));
        setBookingData(result);
    };

    // ==================== Hooks ====================
    useEffect(() => {
        fetchStation();
    }, []);

    useEffect(() => {
        if (station) fetchBookings();
    }, [station]);

    useEffect(() => {
        fetchBookingStats(bookingView);
    }, [bookingView, bookings]);

    // ==================== Render ====================
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-purple-700">
                    Manager Dashboard
                </h1>
                <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-md"
                    onClick={fetchStation}
                >
                    <RefreshCcw size={16} /> Làm mới
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-24 animate-pulse text-lg">
                    Đang tải dữ liệu...
                </div>
            ) : station ? (
                <>
                    {/* Thông tin trạm + bản đồ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold text-purple-700 mb-4">Trạm của bạn</h3>
                            <div className="space-y-3">
                                <p className="text-base font-semibold">{station.name}</p>
                                <p className="text-sm text-gray-600">{station.address}</p>
                                <p className="text-sm text-gray-500">
                                    Tọa độ: {station.latitude}, {station.longitude}
                                </p>
                                <p className={`text-sm font-semibold ${station.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                    {station.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                                </p>
                            </div>
                        </Card>

                        <Card className="col-span-2 p-0 overflow-hidden border border-gray-100 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                                <MapPin size={18} className="text-purple-700" />
                                <h3 className="text-md font-semibold text-purple-700">Bản đồ trạm</h3>
                            </div>
                            <iframe
                                title="station-map"
                                src={`https://www.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&z=15&output=embed`}
                                className="w-full h-[450px]"
                            />
                        </Card>
                    </div>

                    {/* LineChart booking */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-purple-700">
                                Thống kê lượt đặt chỗ ({bookingView})
                            </h2>
                            <div className="flex gap-2">
                                {(["day", "month", "year"] as const).map((view) => (
                                    <Button
                                        key={view}
                                        variant={bookingView === view ? "default" : "outline"}
                                        className={bookingView === view ? "bg-purple-600 text-white" : "border-purple-600 text-purple-600"}
                                        onClick={() => setBookingView(view)}
                                    >
                                        {view === "day" ? "Ngày" : view === "month" ? "Tháng" : "Năm"}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={bookingData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            ) : (
                <p className="text-gray-400 text-center mt-10">Bạn chưa được gán vào trạm nào.</p>
            )}
        </div>
    );
}
