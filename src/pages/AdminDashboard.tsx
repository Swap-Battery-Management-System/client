"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw, MapPin } from "lucide-react";
import api from "@/lib/api";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

// Kiểu Booking
interface Booking {
    id: string;
    scheduleTime: string;
    status: string;
    note?: string;
    [key: string]: any;
}

// Kiểu Station
interface Station {
    id: string;
    name: string;
    status: "active" | "inactive";
    load: number;
    latitude: number;
    longitude: number;
}

export default function AdminDashboard() {
    const [summary, setSummary] = useState<any>({});
    const [stations, setStations] = useState<Station[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [bookingView, setBookingView] = useState<"day" | "month" | "year">("day");
    const [bookingData, setBookingData] = useState<{ name: string; bookings: number }[]>([]);
    const [bookingDetails, setBookingDetails] = useState<Booking[]>([]);
    const [loadingBooking, setLoadingBooking] = useState(false);

    const [userView, setUserView] = useState<"day" | "month" | "year">("day");
    const [userData, setUserData] = useState<{ name: string; count: number }[]>([]);
    const [topCities, setTopCities] = useState<{ city: string; count: number }[]>([]);

    const [selectedLabel, setSelectedLabel] = useState<string | null>(null); // highlight point
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

    const COLORS = ["#4ADE80", "#FACC15", "#FF6B6B", "#38BDF8", "#A78BFA"];


    const cityKeywords = [
        "Hồ Chí Minh",
        "Hà Nội",
        "Đà Nẵng",
        "Cần Thơ",
        "Hải Phòng",
        "An Giang",
        "Bà Rịa - Vũng Tàu",
        "Bình Dương",
        "Bình Phước",
        "Bình Thuận",
        "Bình Định",
        "Bắc Giang",
        "Bắc Kạn",
        "Bắc Ninh",
        "Bến Tre",
        "Cà Mau",
        "Cao Bằng",
        "Đắk Lắk",
        "Đắk Nông",
        "Điện Biên",
        "Đồng Nai",
        "Đồng Tháp",
        "Gia Lai",
        "Hà Giang",
        "Hà Nam",
        "Hà Tĩnh",
        "Hải Dương",
        "Hậu Giang",
        "Hòa Bình",
        "Hưng Yên",
        "Khánh Hòa",
        "Kiên Giang",
        "Kon Tum",
        "Lai Châu",
        "Lạng Sơn",
        "Lào Cai",
        "Lâm Đồng",
        "Long An",
        "Nam Định",
        "Nghệ An",
        "Ninh Bình",
        "Ninh Thuận",
        "Phú Thọ",
        "Phú Yên",
        "Quảng Bình",
        "Quảng Nam",
        "Quảng Ngãi",
        "Quảng Ninh",
        "Quảng Trị",
        "Sóc Trăng",
        "Sơn La",
        "Tây Ninh",
        "Thái Bình",
        "Thái Nguyên",
        "Thanh Hóa",
        "Thừa Thiên Huế",
        "Tiền Giang",
        "Trà Vinh",
        "Tuyên Quang",
        "Vĩnh Long",
        "Vĩnh Phúc",
        "Yên Bái",
    ];
    const DRIVER_ROLE_ID = "df04443d-75f1-4ef4-a475-54627ddf2d8a";


    // ==================== Fetch Summary ====================
    const fetchSummary = async () => {
        try {
            setLoading(true);
            const [stationsRes, bookingsRes, usersRes] = await Promise.all([
                api.get("/stations", { withCredentials: true }),
                api.get("/bookings", { withCredentials: true }),
                api.get("/users", { withCredentials: true }), // thêm fetch users
            ]);

            const stationsApi: Station[] = stationsRes?.data?.data?.stations || [];
            const bookingsApi: Booking[] = bookingsRes?.data?.data?.bookings || [];
            const usersApi: any[] = usersRes?.data?.data?.users || [];

            // Lọc driver
            const drivers = usersApi.filter((u) => u.roleId === DRIVER_ROLE_ID);

            console.log("driver", drivers);

            setStations(stationsApi);
            setBookings(bookingsApi);

            setSummary({
                totalStations: stationsApi.length,
                activeStations: stationsApi.filter((s) => s.status === "active").length,
                inactiveStations: stationsApi.filter((s) => s.status === "inactive").length,
                highLoadStations: stationsApi.filter((s) => s.load >= 80).length,
                totalBookings: bookingsApi.length,
                totalDrivers: drivers.length, // thêm số driver
            });
        } catch (err) {
            console.error("Failed to load summary", err);
            toast.error("Không thể tải dữ liệu tổng quan");
        } finally {
            setLoading(false);
        }
    };


    // ==================== Fetch User Stats ====================

    const fetchUserStats = async (range: "day" | "month" | "year") => {
        try {
            setLoadingBooking(true); // có thể dùng state riêng nếu muốn
            const res = await api.get("/users", { withCredentials: true });
            const usersApi: any[] = res.data?.data?.users || [];

            // Chỉ lấy user có role là driver
            const drivers = usersApi.filter((u) => u.roleId === DRIVER_ROLE_ID);

            if (drivers.length === 0) {
                setUserData([]);
                return;
            }

            const userDates: Dayjs[] = drivers.map((u) => dayjs.utc(u.createdAt));
            const firstDate: Dayjs = userDates.reduce((min: Dayjs, u: Dayjs) => (u.isBefore(min) ? u : min));
            const today: Dayjs = dayjs().utc();

            // Đếm driver theo key
            const counts: Record<string, number> = {};
            drivers.forEach((u) => {
                const date = dayjs.utc(u.createdAt);
                if (date.isAfter(today, "day")) return;
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

            // Tạo mảng dữ liệu cho biểu đồ
            const result: { name: string; count: number }[] = [];
            let current = firstDate.startOf(range);
            while (!current.isAfter(today, range)) {
                let key = "";
                switch (range) {
                    case "day":
                        key = current.format("DD/MM/YYYY");
                        break;
                    case "month":
                        key = current.format("MM/YYYY");
                        break;
                    case "year":
                        key = current.format("YYYY");
                        break;
                }
                result.push({ name: key, count: counts[key] || 0 });
                current =
                    range === "day"
                        ? current.add(1, "day")
                        : range === "month"
                            ? current.add(1, "month")
                            : current.add(1, "year");
            }

            setUserData(result);
            setSelectedLabel(result[result.length - 1]?.name || null);
        } catch (err) {
            console.error("Lỗi khi tải thống kê driver:", err);
            toast.error("Không thể tải thống kê driver mới!");
        } finally {
            setLoadingBooking(false);
        }
    };

    function getCityName(address?: string): string {
        if (!address) return "Chưa xác định";

        const lower = address.toLowerCase();

        // Dò xem có tên tỉnh/thành nào trong chuỗi không
        for (const keyword of cityKeywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return keyword;
            }
        }

        const parts = address.split(",").map((p) => p.trim());
        if (parts.length >= 2) return parts[parts.length - 2];

        return "Chưa xác định";
    }


    const fetchTopCities = async () => {
        try {
            const res = await api.get("/users", { withCredentials: true });
            const usersApi: any[] = res.data?.data?.users || [];

            const drivers = usersApi.filter((u) => u.roleId === DRIVER_ROLE_ID);
            const counts: Record<string, number> = {};

            drivers.forEach((u) => {
                const city = u.city?.trim() || getCityName(u.address);
                counts[city] = (counts[city] || 0) + 1;
            });

            const result = Object.entries(counts)
                .map(([city, count]) => ({ city, count }))
                .sort((a, b) => b.count - a.count);

            setTopCities(result.slice(0, 5));
        } catch (err) {
            console.error("Lỗi khi tải thống kê tỉnh/thành phố:", err);
            toast.error("Không thể tải thống kê tỉnh/thành phố!");
        }
    };




    // ==================== Fetch Booking Stats ====================
    const fetchBookingStats = async (range: "day" | "month" | "year") => {
        try {
            setLoadingBooking(true);
            const res = await api.get("/bookings", { withCredentials: true });
            const bookingsApi: Booking[] = res.data?.data?.bookings || [];

            if (bookingsApi.length === 0) {
                setBookingData([]);
                setBookingDetails([]);
                return;
            }



            const bookingDates: Dayjs[] = bookingsApi.map((b) => dayjs.utc(b.scheduleTime));
            const firstDate: Dayjs = bookingDates.reduce((min: Dayjs, b: Dayjs) => (b.isBefore(min) ? b : min));
            const today: Dayjs = dayjs().utc();

            // Đếm booking theo key
            const counts: Record<string, number> = {};
            bookingsApi.forEach((b) => {
                const date = dayjs.utc(b.scheduleTime);
                if (date.isAfter(today, "day")) return;
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

            // Tạo mảng dữ liệu cho biểu đồ
            const result: { name: string; bookings: number }[] = [];
            let current = firstDate.startOf(range);
            while (!current.isAfter(today, range)) {
                let key = "";
                switch (range) {
                    case "day":
                        key = current.format("DD/MM/YYYY");
                        break;
                    case "month":
                        key = current.format("MM/YYYY");
                        break;
                    case "year":
                        key = current.format("YYYY");
                        break;
                }
                result.push({ name: key, bookings: counts[key] || 0 });
                current =
                    range === "day"
                        ? current.add(1, "day")
                        : range === "month"
                            ? current.add(1, "month")
                            : current.add(1, "year");
            }
            setBookingData(result);

            // Mặc định hiển thị chi tiết của ngày/tháng/năm mới nhất
            const latestKey = result[result.length - 1].name;
            const details = bookingsApi.filter((b) => {
                const date = dayjs.utc(b.scheduleTime);
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
                return key === latestKey;
            })
                .map((b) => ({
                    ...b,
                    bookingCode: (b.code || b.id).split("-")[0],
                }));

            setBookingDetails(details);
            setSelectedLabel(latestKey);
        } catch (err) {
            console.error("Lỗi khi tải thống kê booking:", err);
            toast.error("Không thể tải thống kê lượt đặt chỗ!");
        } finally {
            setLoadingBooking(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        fetchUserStats(userView);
    }, [userView]);

    useEffect(() => {
        fetchTopCities();
    }, []);


    useEffect(() => {
        fetchBookingStats(bookingView);
    }, [bookingView]);


    const getMapBBox = () => {
        if (selectedStation) {
            const lat = selectedStation.latitude;
            const lng = selectedStation.longitude;
            const delta = 0.005; // zoom gần, khoảng 0.5km
            return `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
        }
        // default bbox toàn thành phố
        return "106.6,10.7,106.8,10.85";
    };



    // ==================== Render ====================
    return (
        <div className="min-h-screen bg-gradient-to-b p-6 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-[#5B21B6] tracking-tight">Bảng điều khiển quản trị</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white flex items-center gap-2 shadow-md"
                        onClick={fetchSummary}
                    >
                        <RefreshCcw size={16} /> Làm mới
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-24 animate-pulse text-lg">Đang tải dữ liệu...</div>
            ) : (
                <>
                    {/* ==================== User Stats Card ==================== */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
                        <h3 className="text-md font-semibold text-[#6D28D9] mb-4">Thống kê người dùng</h3>

                        {/* Tổng số user */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Tổng số người dùng (Driver):</p>
                            <p className="text-lg font-semibold">{summary.totalDrivers || 0}</p>
                        </div>


                        {/* LineChart đăng ký theo ngày/tháng/năm */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-700">
                                    Người dùng mới ({userView})
                                </p>
                                <div className="flex gap-1">
                                    {(["day", "month", "year"] as const).map((view) => (
                                        <Button
                                            key={view}
                                            variant={userView === view ? "default" : "outline"}
                                            className={
                                                userView === view
                                                    ? "bg-[#6D28D9] text-white"
                                                    : "border-[#6D28D9] text-[#6D28D9]"
                                            }
                                            onClick={() => setUserView(view)}
                                            size="sm"
                                        >
                                            {view === "day" ? "Ngày" : view === "month" ? "Tháng" : "Năm"}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Hiển thị số người dùng mới của selectedLabel */}
                            <div className="mb-2 text-sm text-gray-600">
                                {selectedLabel
                                    ? `Người dùng mới: ${userData.find((u) => u.name === selectedLabel)?.count || 0
                                    }`
                                    : "Chọn ngày/tháng/năm để xem số người dùng mới"}
                            </div>

                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                    data={userData}
                                    onClick={(e: any) => {
                                        if (!e || !e.activeLabel) return;
                                        setSelectedLabel(e.activeLabel);
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-2 border rounded shadow-lg text-sm">
                                                        <p className="font-medium text-gray-700">{label}</p>
                                                        <p className="text-blue-600 font-semibold">
                                                            Người dùng mới: {payload[0].value}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Drivers"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={{ r: 5, strokeWidth: 2, fill: "#3B82F6" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>

                        </div>

                        {/* PieChart top tỉnh/thành phố */}
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Danh sách bên trái */}
                            <div className="md:w-1/3 bg-white rounded-2xl shadow-md p-4">
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Top 5 tỉnh/thành phố</h4>
                                <ul className="divide-y divide-gray-200">
                                    {topCities.slice(0, 5).map((c, idx) => (
                                        <li
                                            key={idx}
                                            className="flex justify-between items-center py-3 hover:bg-purple-50 px-2 rounded-lg transition"
                                        >
                                            <span className="text-gray-700 font-medium">{c.city}</span>
                                            <span className="text-purple-600 font-semibold">{c.count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* PieChart bên phải */}
                            <div className="md:w-2/3 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={topCities}
                                            dataKey="count"
                                            nameKey="city"
                                            outerRadius={80}
                                            label={(props) => {
                                                const name = props.name || props.payload.city;
                                                const percent = props.percent ?? 0;
                                                return `${name} (${(percent * 100).toFixed(1)}%)`;
                                            }}
                                        >
                                            {topCities.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} người dùng`, `Thành phố`]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </Card>

                    {/* Booking Stats + Chi tiết */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-[#6D28D9]">
                                Thống kê lượt đặt chỗ ({bookingView})
                            </h2>
                            <div className="flex gap-2">
                                {(["day", "month", "year"] as const).map((view) => (
                                    <Button
                                        key={view}
                                        variant={bookingView === view ? "default" : "outline"}
                                        className={
                                            bookingView === view
                                                ? "bg-[#6D28D9] text-white"
                                                : "border-[#6D28D9] text-[#6D28D9]"
                                        }
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
                            <div className="flex gap-6 overflow-x-auto">
                                {/* LineChart */}
                                <div style={{ minWidth: bookingData.length * 80, flex: 1 }}>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart
                                            data={bookingData}
                                            onClick={(e: any) => {
                                                if (!e || !e.activeLabel) return;
                                                const label = e.activeLabel;
                                                setSelectedLabel(label);
                                                const details = bookings.filter((b) => {
                                                    const date = dayjs.utc(b.scheduleTime);
                                                    let key = "";
                                                    switch (bookingView) {
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
                                                    return key === label;
                                                })
                                                    .map((b) => ({
                                                        ...b,
                                                        bookingCode: (b.code || b.id).split("-")[0],
                                                    }));
                                                setBookingDetails(details);
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="bookings"
                                                name="Bookings"
                                                stroke="#8B5CF6"
                                                strokeWidth={3}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    const isSelected = payload.name === selectedLabel;
                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={isSelected ? 6 : 4}
                                                            fill={isSelected ? "#FF5722" : "#8B5CF6"}
                                                            stroke="#fff"
                                                            strokeWidth={1}
                                                        />
                                                    );
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Chi tiết booking */}
                                <div className="w-[400px] bg-white rounded-xl shadow-lg p-4 overflow-y-auto max-h-[400px]">
                                    <h3 className="text-md font-semibold text-[#6D28D9] mb-2">Booking</h3>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-2 py-1">Thời gian</th>
                                                <th className="px-2 py-1">Mã Booking</th>
                                                <th className="px-2 py-1">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookingDetails.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-2">
                                                        Không có booking
                                                    </td>
                                                </tr>
                                            ) : (
                                                bookingDetails.map((b) => (
                                                    <tr key={b.id} className="border-b">
                                                        <td className="px-2 py-1">
                                                            {b.scheduleTime.replace("T", " ").replace(".000Z", "")}
                                                        </td>
                                                        <td className="px-2 py-1">{b.bookingCode}</td>
                                                        <td
                                                            className={`px-2 py-1 font-semibold ${b.status === "completed"
                                                                ? "text-green-600"
                                                                : b.status === "canceled"
                                                                    ? "text-red-600"
                                                                    : "text-gray-600"
                                                                }`}
                                                        >
                                                            {b.status}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Trạng thái Station + Bản đồ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card Trạng thái & Danh sách trạm */}
                        <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-md font-semibold text-[#6D28D9] mb-4">Trạng thái Trạm</h3>

                            {/* Tổng trạm */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Tổng số trạm:</p>
                                <p className="text-lg font-semibold">{summary.totalStations || 0}</p>
                            </div>

                            {/* PieChart */}
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Hoạt động", value: summary.activeStations },
                                            { name: "Ngừng", value: summary.inactiveStations },
                                            { name: "Tải cao", value: summary.highLoadStations },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={70}
                                        label
                                    >
                                        {[summary.activeStations, summary.inactiveStations, summary.highLoadStations].map(
                                            (_, j) => (
                                                <Cell key={j} fill={COLORS[j % COLORS.length]} />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Danh sách trạm */}
                            <div className="mt-4 max-h-48 overflow-y-auto">
                                {stations.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center">Không có trạm nào</p>
                                ) : (
                                    stations.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedStation(s)}
                                            className="flex justify-between items-center py-1 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                                        >
                                            <span className="text-sm font-medium">{s.name}</span>
                                            <span
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : s.status === "inactive"
                                                        ? "bg-red-100 text-red-800"
                                                        : s.load >= 80
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {s.status === "active"
                                                    ? "Hoạt động"
                                                    : s.status === "inactive"
                                                        ? "Ngừng"
                                                        : s.load >= 80
                                                            ? "Tải cao"
                                                            : "-"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Bản đồ Station */}
                        <Card className="p-0 bg-white rounded-2xl shadow-lg border border-gray-100 col-span-2 overflow-hidden">
                            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                                <MapPin size={18} className="text-[#6D28D9]" />
                                <h3 className="text-md font-semibold text-[#6D28D9]">Bản đồ trạm sạc</h3>
                            </div>
                            <iframe
                                title="stations-map"
                                src={
                                    selectedStation
                                        ? `https://www.google.com/maps?q=${selectedStation.latitude},${selectedStation.longitude}&hl=vi&z=15&output=embed`
                                        : `https://www.openstreetmap.org/export/embed.html?bbox=${getMapBBox()}&layer=mapnik`
                                }
                                className="w-full h-[500px]"
                            />
                        </Card>
                    </div>

                </>
            )}
        </div>
    );
}
