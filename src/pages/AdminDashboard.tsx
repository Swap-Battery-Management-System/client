"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
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
    ComposedChart,
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

            setSummary({
                users: users.length,
                vehicles: vehicles.length,
                models: models.length,
                batteryTypes: batteryTypes.length,
                batteries: batteries.length,
                pending: vehicles.filter((v: any) => v.status === "pending").length,
                active: vehicles.filter((v: any) => v.status === "active").length,
                invalid: vehicles.filter((v: any) => v.status === "invalid").length,
                inactive: vehicles.filter((v: any) => v.status === "inactive").length,
                batteryActive: batteries.filter((b: any) => b.status === "active").length,
                batteryInactive: batteries.filter((b: any) => b.status === "inactive").length,
                batteryCharging: batteries.filter((b: any) => b.status === "charging").length,
                totalStations: stations.length,
                activeStations: stations.filter((s: any) => s.status === "active").length,
                inactiveStations: stations.filter((s: any) => s.status === "inactive").length,
                maintenanceStations: stations.filter((s: any) => s.status === "maintenance").length,
                highLoadStations: stations.filter((s: any) => s.load >= 80).length,
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

    const COLORS = ["#8B5CF6", "#C084FC", "#E9D5FF", "#DDD6FE"];

    const barData = [
        { name: "Người dùng", value: summary.users },
        { name: "Xe", value: summary.vehicles },
        { name: "Model", value: summary.models },
        { name: "Loại Pin", value: summary.batteryTypes },
        { name: "Pin", value: summary.batteries },
        { name: "Trạm", value: summary.totalStations },
    ];

    const combinedData = [
        {
            name: "Hoạt động",
            Xe: summary.active,
            Pin: summary.batteryActive,
            Trạm: summary.activeStations,
        },
        {
            name: "Ngừng",
            Xe: summary.inactive,
            Pin: summary.batteryInactive,
            Trạm: summary.inactiveStations,
        },
        {
            name: "Đang xử lý",
            Xe: summary.pending,
            Pin: summary.batteryCharging,
            Trạm: summary.maintenanceStations,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#EDE9FE] p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#5B21B6] tracking-tight">
                    Bảng điều khiển quản trị
                </h1>
                <Button
                    className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white flex items-center gap-2"
                    onClick={fetchSummary}
                >
                    <RefreshCcw size={16} /> Làm mới
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-24 animate-pulse text-lg">
                    Đang tải dữ liệu...
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
                        {[
                            { title: "Người dùng", value: summary.users, icon: "👥" },
                            { title: "Xe", value: summary.vehicles, icon: "🚗" },
                            { title: "Model", value: summary.models, icon: "🧩" },
                            { title: "Loại Pin", value: summary.batteryTypes, icon: "🔋" },
                            { title: "Pin", value: summary.batteries, icon: "⚡" },
                            { title: "Trạm", value: summary.totalStations, icon: "🏭" },
                        ].map((item, i) => (
                            <Card
                                key={i}
                                className="bg-white shadow-xl rounded-2xl p-5 text-center hover:shadow-2xl transition-transform hover:-translate-y-1 border border-gray-100"
                            >
                                <div className="text-3xl mb-1">{item.icon}</div>
                                <p className="text-gray-500 text-sm">{item.title}</p>
                                <h2 className="text-2xl font-bold text-[#6D28D9]">{item.value}</h2>
                            </Card>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        {[
                            {
                                title: "Trạng thái Xe", data: [
                                    { name: "Đang chờ", value: summary.pending },
                                    { name: "Đã duyệt", value: summary.active },
                                    { name: "Từ chối", value: summary.invalid },
                                    { name: "Ngừng", value: summary.inactive },
                                ]
                            },
                            {
                                title: "Trạng thái Pin", data: [
                                    { name: "Hoạt động", value: summary.batteryActive },
                                    { name: "Sạc", value: summary.batteryCharging },
                                    { name: "Ngừng", value: summary.batteryInactive },
                                ]
                            },
                            {
                                title: "Trạng thái Trạm", data: [
                                    { name: "Hoạt động", value: summary.activeStations },
                                    { name: "Bảo trì", value: summary.maintenanceStations },
                                    { name: "Ngừng", value: summary.inactiveStations },
                                    { name: "Tải cao", value: summary.highLoadStations },
                                ]
                            },
                        ].map((chart, i) => (
                            <Card key={i} className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                                <h2 className="text-lg font-semibold text-center mb-4 text-[#6D28D9]">
                                    {chart.title}
                                </h2>
                                <div className="w-full h-[280px]">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={90} label>
                                                {chart.data.map((_, j) => (
                                                    <Cell key={j} fill={COLORS[j % COLORS.length]} />
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

                    {/* Combined Performance Chart */}
                    <Card className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-lg font-semibold text-center mb-4 text-[#6D28D9]">
                            Hiệu suất tổng thể
                        </h2>
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer>
                                <ComposedChart data={combinedData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Xe" barSize={20} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Pin" barSize={20} fill="#C084FC" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="Trạm" stroke="#FBBF24" strokeWidth={3} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
