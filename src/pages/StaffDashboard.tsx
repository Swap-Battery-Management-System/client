"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Battery, MapPin, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
    note?: string;
    stationId: string;
    [key: string]: any;
}

interface BatteryType {
    id: string;
    code: string;
    status: "in-use" | "available" | "faulty" | "in-transit" | "reserved" | "in-charged";
    soc: string;
    temperature: string;
    voltage: string;
    [key: string]: any;
}

interface Station {
    id: string;
    name: string;
    status: "active" | "inactive";
    latitude: number;
    longitude: number;
    address?: string;
    batteries: BatteryType[];
}

const StatCard = ({
    title,
    value,
    percent = 100,
    onClick,
    className = "",
}: {
    title: string;
    value: number;
    percent?: number;
    onClick?: () => void;
    className?: string;
}) => (
    <Card
        className={`p-5 rounded-xl shadow-md border border-gray-100 ${className} cursor-pointer`}
        onClick={onClick}
    >
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-center gap-3 mt-2">
            <Battery className="w-10 h-10 text-green-600" />
            <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{percent}%</p>
        </div>
    </Card>
);

export default function StaffDashboard() {
    const [station, setStation] = useState<Station | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [bookingView, setBookingView] = useState<"day" | "month" | "year">("day");
    const [bookingData, setBookingData] = useState<{ name: string; bookings: number }[]>([]);
    const [bookingDetails, setBookingDetails] = useState<Booking[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [selectedBatteryStatus, setSelectedBatteryStatus] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [bookingPage, setBookingPage] = useState(1);
    const navigate = useNavigate();



    // ==================== Fetch Staff Station ====================
    const fetchStaffStation = async () => {
        try {
            setLoading(true);
            const res = await api.get("/stations", { withCredentials: true });

            const apiStation = res.data?.data?.stations;

            if (apiStation) {
                // nếu API trả về mảng, lấy trạm đầu tiên
                const sData = Array.isArray(apiStation) ? apiStation[0] : apiStation;

                const s: Station = {
                    ...sData,
                    batteries: Array.isArray(sData.batteries) ? sData.batteries : [],
                };
                setStation(s);

                // gán bookings nếu có
                if (res.data?.data?.bookings) {
                    setBookings(res.data.data.bookings);
                }

                // log tổng pin & status
                const statusSummary: Record<string, number> = {};
                s.batteries.forEach((b) => {
                    statusSummary[b.status] = (statusSummary[b.status] || 0) + 1;
                });
            } else {
                console.log("Station not assigned!");
                toast.info("Bạn chưa được gán vào trạm nào.");
            }
        } catch (err) {
            console.error("Failed to load staff station:", err);
            toast.error("Không thể tải thông tin trạm của bạn");
        } finally {
            setLoading(false);
        }
    };

    // ==================== Fetch Bookings ====================
    const fetchBookings = async () => {
        if (!station) return;
        try {
            setLoadingBooking(true);
            const res = await api.get(`/bookings?stationId=${station.id}`, { withCredentials: true });
            setBookings(res.data?.data?.bookings || []);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            toast.error("Không thể tải dữ liệu đặt chỗ");
        } finally {
            setLoadingBooking(false);
        }
    };

    // ==================== Booking Stats ====================
    const fetchBookingStats = (range: "day" | "month" | "year") => {
        if (!bookings || bookings.length === 0) {
            console.log("No bookings available");
            setBookingData([]);
            setBookingDetails([]);
            setSelectedLabel(null);
            return;
        }

        // 1. Đếm số lượt đặt chỗ theo key (ngày/tháng/năm)
        const counts: Record<string, number> = {};

        bookings.forEach((b) => {
            if (!b.scheduleTime) return;

            const date = dayjs.utc(b.scheduleTime);
            if (!date.isValid()) return;

            let key = "";
            switch (range) {
                case "day":
                    key = date.format("DD/MM/YYYY");
                    break;
                case "month":
                    key = date.format("MM/YYYY");
                    break;
                case "year":
                    key = date.format("YYYY");
                    break;
            }

            counts[key] = (counts[key] || 0) + 1;
        });


        // 2. Sắp xếp key từ ngày cũ → ngày mới
        const sortedKeys = Object.keys(counts).sort((a, b) => {
            const da = dayjs.utc(a.split('/').reverse().join('-')); // "YYYY-MM-DD"
            const db = dayjs.utc(b.split('/').reverse().join('-'));
            return da.valueOf() - db.valueOf(); // từ ngày cũ → ngày mới
        });


        // 3. Chuyển thành mảng để LineChart dùng
        const result = sortedKeys.map((key) => ({ name: key, bookings: counts[key] }));
        setBookingData(result);

        // 4. Lấy chi tiết của ngày mới nhất (hiển thị bảng)
        if (result.length > 0) {
            const latestKey = result[result.length - 1].name;

            const details = bookings.filter((b) => {
                const date = dayjs.utc(b.scheduleTime);
                let key = "";
                switch (range) {
                    case "day": key = date.format("DD/MM/YYYY"); break;
                    case "month": key = date.format("MM/YYYY"); break;
                    case "year": key = date.format("YYYY"); break;
                }
                return key === latestKey;
            });


            setBookingDetails(details);
            setSelectedLabel(latestKey);
        } else {
            setBookingDetails([]);
            setSelectedLabel(null);
        }
    };


    // ==================== Hooks ====================
    useEffect(() => {
        fetchStaffStation();
    }, []);

    useEffect(() => {
        if (station) fetchBookings();
    }, [station]);

    useEffect(() => {
        fetchBookingStats(bookingView);
    }, [bookingView, bookings]);

    // ==================== Render ====================
    return (
        <div className="min-h-screen bg-gradient-to-b p-6 md:p-12 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl md:text-5xl font-bold text-[#5B21B6]">Staff Dashboard</h1>
                <Button
                    className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white flex items-center gap-2 shadow-md"
                    onClick={fetchStaffStation}
                >
                    <RefreshCcw size={16} /> Làm mới
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-24 animate-pulse text-lg">Đang tải dữ liệu...</div>
            ) : station ? (
                <>
                    {/* Trạm + Bản đồ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-lg font-semibold text-[#6D28D9] mb-4">Trạm của bạn</h3>
                            <div className="space-y-3">
                                <p className="text-base font-semibold">{station.name}</p>
                                <p className="text-sm text-gray-600">{station.address}</p>
                                <p className="text-sm text-gray-500">Tọa độ: {station.latitude}, {station.longitude}</p>
                                <p className={`text-sm font-semibold ${station.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                    {station.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                                </p>
                            </div>
                        </Card>

                        <Card className="col-span-2 p-0 overflow-hidden border border-gray-100 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                                <MapPin size={18} className="text-[#6D28D9]" />
                                <h3 className="text-md font-semibold text-[#6D28D9]">Bản đồ trạm</h3>
                            </div>
                            <iframe
                                title="station-map"
                                src={`https://www.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&z=15&output=embed`}
                                className="w-full h-[450px]"
                            />
                        </Card>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ==================== Bên trái: StatCard ==================== */}
                        <div className="space-y-4 md:col-span-1">
                            {/* Tổng số pin */}
                            <StatCard
                                title="Tổng số pin"
                                value={station.batteries.length}
                                percent={100}
                                onClick={() => setSelectedBatteryStatus("all")}
                            />

                            {/* Trạng thái pin */}
                            <div className="grid grid-cols-3 gap-2">
                                {["in-use", "available", "faulty", "in-transit", "reserved", "in-charged"].map((status) => {
                                    const count = station.batteries.filter((b) => b.status === status).length;
                                    const percent = Number(((count / station.batteries.length) * 100).toFixed(0));
                                    return (
                                        <StatCard
                                            key={status}
                                            title={status.replace("-", " ")}
                                            value={count}
                                            percent={percent}
                                            onClick={() => {
                                                if (selectedBatteryStatus === status) {
                                                    // Click 2 lần → hiện tất cả pin
                                                    setSelectedBatteryStatus("all");
                                                } else {
                                                    setSelectedBatteryStatus(status);
                                                }
                                            }}
                                            className="cursor-pointer hover:shadow-lg"
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* ==================== Bên phải: Bảng pin chi tiết với phân trang ==================== */}
                        <div className="md:col-span-2">
                            <Card className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-[#6D28D9]">
                                        {selectedBatteryStatus && selectedBatteryStatus !== "all"
                                            ? `Danh sách pin: ${selectedBatteryStatus.replace("-", " ")}`
                                            : "Danh sách tất cả pin"}
                                    </h2>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate("/staff/manage-battery")}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>


                                {/* Lọc theo status */}
                                {station.batteries.filter((b) => selectedBatteryStatus === "all" || b.status === selectedBatteryStatus).length === 0 ? (
                                    <p className="text-gray-400 text-center">Không có pin nào</p>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">ID</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Code</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Trạng thái</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">SOC</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Nhiệt độ</th>
                                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Điện áp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const filtered = station.batteries.filter(
                                                            (b) => selectedBatteryStatus === "all" || b.status === selectedBatteryStatus
                                                        );
                                                        const ITEMS_PER_PAGE = 8;
                                                        const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
                                                        const currentPageData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

                                                        return currentPageData.map((b) => (
                                                            <tr key={b.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.id}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.code}</td>
                                                                <td className="px-4 py-2 text-sm font-semibold border-b">{b.status}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.soc}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.temperature}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.voltage}</td>
                                                            </tr>
                                                        ));
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {(() => {
                                            const filtered = station.batteries.filter(
                                                (b) => selectedBatteryStatus === "all" || b.status === selectedBatteryStatus
                                            );
                                            const ITEMS_PER_PAGE = 8;
                                            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

                                            return (
                                                <div className="flex justify-center items-center gap-4 mt-4">
                                                    <button
                                                        disabled={page === 1}
                                                        onClick={() => setPage((p) => p - 1)}
                                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                                    >
                                                        Trước
                                                    </button>
                                                    <span>
                                                        Trang {page} / {totalPages}
                                                    </span>
                                                    <button
                                                        disabled={page === totalPages}
                                                        onClick={() => setPage((p) => p + 1)}
                                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </Card>
                        </div>

                    </div>


                    {/* Biểu đồ booking */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-[#6D28D9]">Thống kê lượt đặt chỗ ({bookingView})</h2>
                            <div className="flex gap-2">
                                {(["day", "month", "year"] as const).map((view) => (
                                    <Button
                                        key={view}
                                        variant={bookingView === view ? "default" : "outline"}
                                        className={bookingView === view ? "bg-[#6D28D9] text-white" : "border-[#6D28D9] text-[#6D28D9]"}
                                        onClick={() => setBookingView(view)}
                                        disabled={loadingBooking}
                                    >
                                        {view === "day" ? "Ngày" : view === "month" ? "Tháng" : "Năm"}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {loadingBooking ? (
                            <div className="text-center text-gray-400 mt-20">Đang tải biểu đồ...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    data={bookingData}
                                    onClick={(e: any) => {
                                        if (!e?.activeLabel) return;
                                        const label = e.activeLabel;
                                        setSelectedLabel(label);
                                        const details = bookings.filter((b) => {
                                            const date = dayjs.utc(b.scheduleTime);
                                            let key = "";
                                            switch (bookingView) {
                                                case "day": key = date.format("DD/MM/YYYY"); break;
                                                case "month": key = date.format("MM/YYYY"); break;
                                                case "year": key = date.format("YYYY"); break;
                                            }
                                            return key === label;
                                        });
                                        setBookingDetails(details);
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="bookings" stroke="#8B5CF6" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* Booking Details Table with Pagination */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-[#6D28D9]">
                                Chi tiết lượt đặt chỗ {selectedLabel ? `(${selectedLabel})` : ""}
                            </h2>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate("/staff/manage-booking")}
                            >
                                Xem chi tiết
                            </Button>
                        </div>

                        {bookingDetails.length === 0 ? (
                            <p className="text-gray-400 text-center">Không có lượt đặt chỗ</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">ID</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Thời gian</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Trạng thái</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Ghi chú</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Trạm</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const ITEMS_PER_PAGE = 8;
                                                const totalPages = Math.ceil(bookingDetails.length / ITEMS_PER_PAGE) || 1;
                                                const currentPageData = bookingDetails.slice(
                                                    (bookingPage - 1) * ITEMS_PER_PAGE,
                                                    bookingPage * ITEMS_PER_PAGE
                                                );

                                                return currentPageData.map((b) => (
                                                    <tr key={b.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.id}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 border-b">
                                                            {dayjs.utc(b.scheduleTime).format("DD/MM/YYYY HH:mm")}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm font-semibold border-b">{b.status}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.note || "-"}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 border-b">{b.stationId}</td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center items-center gap-4 mt-4">
                                    {(() => {
                                        const ITEMS_PER_PAGE = 8;
                                        const totalPages = Math.ceil(bookingDetails.length / ITEMS_PER_PAGE) || 1;

                                        return (
                                            <>
                                                <button
                                                    disabled={bookingPage === 1}
                                                    onClick={() => setBookingPage((p) => p - 1)}
                                                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                                >
                                                    Trước
                                                </button>
                                                <span>
                                                    Trang {bookingPage} / {totalPages}
                                                </span>
                                                <button
                                                    disabled={bookingPage === totalPages}
                                                    onClick={() => setBookingPage((p) => p + 1)}
                                                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                                >
                                                    Sau
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </>
                        )}
                    </Card>

                </>
            ) : (
                <p className="text-gray-400 text-center mt-10">Bạn chưa được gán vào trạm nào.</p>
            )
            }
        </div >
    );
}
