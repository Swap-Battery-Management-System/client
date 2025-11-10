"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";

interface Summary {
    users: number;
    vehicles: number;
    models: number;
    batteryTypes: number;
    batteries: number;
    pending: number;
    active: number;
    invalid: number;
    inactive: number;
    batteryActive: number;
    batteryInactive: number;
    batteryCharging: number;

    // 🏭 Thêm dữ liệu thống kê trạm
    totalStations: number;
    activeStations: number;
    inactiveStations: number;
    maintenanceStations: number;
    highLoadStations: number;
}

export default function AdminDashboard() {
    const [summary, setSummary] = useState<Summary>({
        users: 0,
        vehicles: 0,
        models: 0,
        batteryTypes: 0,
        batteries: 0,
        pending: 0,
        active: 0,
        invalid: 0,
        inactive: 0,
        batteryActive: 0,
        batteryInactive: 0,
        batteryCharging: 0,
        totalStations: 0,
        activeStations: 0,
        inactiveStations: 0,
        maintenanceStations: 0,
        highLoadStations: 0,
    });

    const [loading, setLoading] = useState(true);

    const fetchSummary = async () => {
        try {
            setLoading(true);

            const [usersRes, vehiclesRes, modelsRes, batteryTypeRes, batteriesRes, stationsRes] = await Promise.all([
                api.get("/users", { withCredentials: true }),
                api.get("/vehicles", { withCredentials: true }),
                api.get("/models", { withCredentials: true }),
                api.get("/battery-types", { withCredentials: true }),
                api.get("/batteries", { withCredentials: true }),
                api.get("/stations", { withCredentials: true }),
            ]);

            const users = usersRes?.data?.data?.users || [];
            const vehicles = vehiclesRes?.data?.data?.vehicles || [];
            const models = modelsRes?.data?.data || [];
            const batteryTypes = batteryTypeRes?.data?.data?.batteryTypes || [];
            const batteries = batteriesRes?.data?.data?.batteries || [];
            const stations = stationsRes?.data?.data?.stations || [];

            // 🚗 Trạng thái xe
            const pending = vehicles.filter((v: any) => v.status === "pending").length;
            const active = vehicles.filter((v: any) => v.status === "active").length;
            const invalid = vehicles.filter((v: any) => v.status === "invalid").length;
            const inactive = vehicles.filter((v: any) => v.status === "inactive").length;

            // 🔋 Trạng thái pin
            const batteryActive = batteries.filter((b: any) => b.status === "active").length;
            const batteryInactive = batteries.filter((b: any) => b.status === "inactive").length;
            const batteryCharging = batteries.filter((b: any) => b.status === "charging").length;

            // 🏭 Trạng thái trạm
            const activeStations = stations.filter((s: any) => s.status === "active").length;
            const inactiveStations = stations.filter((s: any) => s.status === "inactive").length;
            const maintenanceStations = stations.filter((s: any) => s.status === "maintenance").length;
            const highLoadStations = stations.filter((s: any) => s.load >= 80).length;

            setSummary({
                users: users.length,
                vehicles: vehicles.length,
                models: models.length,
                batteryTypes: batteryTypes.length,
                batteries: batteries.length,
                pending,
                active,
                invalid,
                inactive,
                batteryActive,
                batteryInactive,
                batteryCharging,
                totalStations: stations.length,
                activeStations,
                inactiveStations,
                maintenanceStations,
                highLoadStations,
            });
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            toast.error("Không thể tải dữ liệu tổng quan!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // 🎨 Dữ liệu biểu đồ
    const COLORS1 = ["#FBBF24", "#34D399", "#F87171", "#9CA3AF"];
    const COLORS2 = ["#34D399", "#60A5FA", "#9CA3AF"];
    const COLORS3 = ["#34D399", "#FBBF24", "#9CA3AF", "#F87171"];

    const vehicleChart = [
        { name: "Đang chờ duyệt", value: summary.pending },
        { name: "Đã duyệt", value: summary.active },
        { name: "Từ chối", value: summary.invalid },
        { name: "Ngừng hoạt động", value: summary.inactive },
    ];

    const batteryChart = [
        { name: "Đang hoạt động", value: summary.batteryActive },
        { name: "Đang sạc", value: summary.batteryCharging },
        { name: "Ngừng hoạt động", value: summary.batteryInactive },
    ];

    const stationChart = [
        { name: "Hoạt động", value: summary.activeStations },
        { name: "Bảo trì", value: summary.maintenanceStations },
        { name: "Ngừng hoạt động", value: summary.inactiveStations },
        { name: "Tải cao", value: summary.highLoadStations },
    ];

    const barChartData = [
        { name: "Người dùng", count: summary.users },
        { name: "Xe", count: summary.vehicles },
        { name: "Model", count: summary.models },
        { name: "Loại Pin", count: summary.batteryTypes },
        { name: "Pin", count: summary.batteries },
        { name: "Trạm", count: summary.totalStations },
    ];

    const lineChartData = [
        { name: "Hoạt động", xe: summary.active, pin: summary.batteryActive, tram: summary.activeStations },
        { name: "Ngừng hoạt động", xe: summary.inactive, pin: summary.batteryInactive, tram: summary.inactiveStations },
        { name: "Đang xử lý", xe: summary.pending, pin: summary.batteryCharging, tram: summary.maintenanceStations },
    ];

    return (
        <div className="flex h-screen bg-[#F8FBFB]">
            <main className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-3xl font-semibold text-center text-[#2F8F9D] mb-8">
                    Bảng điều khiển (Dashboard)
                </h1>

                {loading ? (
                    <div className="text-center text-gray-500 mt-20 animate-pulse">
                        Đang tải dữ liệu tổng quan...
                    </div>
                ) : (
                    <>
                        {/* Cards tổng quan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                            {[
                                { title: "Người dùng", value: summary.users },
                                { title: "Xe", value: summary.vehicles },
                                { title: "Model", value: summary.models },
                                { title: "Loại pin", value: summary.batteryTypes },
                                { title: "Tổng pin", value: summary.batteries },
                                { title: "Tổng trạm", value: summary.totalStations },
                            ].map((item, i) => (
                                <Card
                                    key={i}
                                    className="p-6 text-center shadow-lg rounded-2xl border border-[#CDE8E5] bg-white"
                                >
                                    <p className="text-[#2F8F9D] font-semibold text-lg">{item.title}</p>
                                    <h2 className="text-3xl font-bold mt-2 text-[#38A3A5]">{item.value}</h2>
                                </Card>
                            ))}
                        </div>

                        {/* Biểu đồ tròn */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {[
                                { title: "Trạng thái xe", data: vehicleChart, colors: COLORS1 },
                                { title: "Trạng thái pin", data: batteryChart, colors: COLORS2 },
                                { title: "Trạng thái trạm", data: stationChart, colors: COLORS3 },
                            ].map((chart, i) => (
                                <Card key={i} className="p-6 bg-white border border-[#CDE8E5] rounded-2xl shadow-lg">
                                    <h2 className="text-xl font-semibold text-[#2F8F9D] mb-4 text-center">
                                        {chart.title}
                                    </h2>
                                    <div className="w-full h-[320px]">
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={chart.data}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label
                                                >
                                                    {chart.data.map((_, j) => (
                                                        <Cell key={j} fill={chart.colors[j % chart.colors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Biểu đồ cột */}
                        <Card className="p-6 bg-white border border-[#CDE8E5] rounded-2xl shadow-lg mb-8">
                            <h2 className="text-xl font-semibold text-[#2F8F9D] mb-4 text-center">
                                So sánh tổng số đối tượng
                            </h2>
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer>
                                    <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#38A3A5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Biểu đồ đường */}
                        <Card className="p-6 bg-white border border-[#CDE8E5] rounded-2xl shadow-lg mb-8">
                            <h2 className="text-xl font-semibold text-[#2F8F9D] mb-4 text-center">
                                So sánh hoạt động Xe, Pin và Trạm
                            </h2>
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer>
                                    <LineChart data={lineChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="xe" stroke="#34D399" strokeWidth={2} />
                                        <Line type="monotone" dataKey="pin" stroke="#60A5FA" strokeWidth={2} />
                                        <Line type="monotone" dataKey="tram" stroke="#FBBF24" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Biểu đồ vùng */}
                        <Card className="p-6 bg-white border border-[#CDE8E5] rounded-2xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#2F8F9D] mb-4 text-center">
                                Tỷ lệ trạng thái tổng hợp
                            </h2>
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer>
                                    <AreaChart data={lineChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="xe" stroke="#38A3A5" fill="#A7F3D0" />
                                        <Area type="monotone" dataKey="pin" stroke="#60A5FA" fill="#BFDBFE" />
                                        <Area type="monotone" dataKey="tram" stroke="#FBBF24" fill="#FDE68A" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="flex justify-center mt-6">
                            <Button
                                className="bg-[#2F8F9D] hover:bg-[#267D89] text-white px-6 py-2"
                                onClick={fetchSummary}
                            >
                                Làm mới dữ liệu
                            </Button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}