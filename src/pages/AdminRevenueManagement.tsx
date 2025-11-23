"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import api from "@/lib/api";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface Transaction {
    id: string;
    totalAmount: number;
    status: "processing" | "completed" | "failed";
    createdAt: string;
    updatedAt: string;
}

export default function AdminRevenueManagement() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [revenueView, setRevenueView] = useState<"day" | "month" | "year">("day");
    const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const COLORS = ["#4ADE80", "#FACC15", "#FF6B6B", "#38BDF8", "#A78BFA"];

    // ==================== Fetch Transactions ====================
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            let allTransactions: Transaction[] = [];
            let page = 1;
            let totalPages = 1;

            do {
                console.log(`Fetching page ${page}...`);

                const res = await api.get("/transactions", {
                    params: { page, limit: 50 },
                    withCredentials: true,
                });

                const dataPage: Transaction[] = Array.isArray(res.data?.data?.transactions)
                    ? res.data.data.transactions
                    : [];

                console.log(`Page ${page} returned ${dataPage.length} transactions`);

                allTransactions = allTransactions.concat(dataPage);

                totalPages = res.data?.data?.pagination?.totalPages || 1;
                console.log(`Total pages according to API: ${totalPages}`);
                page++;
            } while (page <= totalPages);

            console.log(`Fetched a total of ${allTransactions.length} transactions`);
            console.log("All transactions fetched:", allTransactions);

            setTransactions(allTransactions);

            // Tính tổng doanh thu
            const total = allTransactions
                .filter((t) => t.status === "completed")
                .reduce((sum, t) => sum + Number(t.totalAmount), 0);

            console.log(`Total revenue from completed transactions: ${total}`);
            setTotalRevenue(total);
        } catch (err) {
            console.error("Lỗi khi tải transactions:", err);
            toast.error("Không thể tải dữ liệu giao dịch!");
        } finally {
            setLoading(false);
        }
    };

    // ==================== Tính dữ liệu cho biểu đồ ====================
    const computeRevenueData = (range: "day" | "month" | "year") => {
        if (!transactions.length) {
            setRevenueData([]);
            return;
        }

        const revenueCounts: Record<string, number> = {};

        // Lọc transactions đã completed và có updatedAt
        const completedTransactions = transactions.filter(
            (t) => t.status === "completed" && t.updatedAt
        );

        if (!completedTransactions.length) {
            setRevenueData([]);
            return;
        }

        const dates = completedTransactions.map((t) => dayjs.utc(t.updatedAt));
        const firstDate: Dayjs = dates.reduce((min, d) => (d.isBefore(min) ? d : min));
        const today: Dayjs = dayjs().utc();

        completedTransactions.forEach((t) => {
            const date = dayjs.utc(t.updatedAt);
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
            revenueCounts[key] = (revenueCounts[key] || 0) + Number(t.totalAmount);
        });

        const result: { name: string; revenue: number }[] = [];
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
            result.push({ name: key, revenue: revenueCounts[key] || 0 });
            current =
                range === "day"
                    ? current.add(1, "day")
                    : range === "month"
                        ? current.add(1, "month")
                        : current.add(1, "year");
        }

        setRevenueData(result);
        setSelectedLabel(result[result.length - 1]?.name || null);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        computeRevenueData(revenueView);
    }, [transactions, revenueView]);

    // ==================== Render ====================
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-purple-700">Báo cáo doanh thu</h1>
                <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-md"
                    onClick={fetchTransactions}
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
                    {/* Tổng doanh thu */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
                        <h2 className="text-xl font-semibold text-purple-700 mb-4">Tổng quan</h2>
                        <p className="text-gray-500">Tổng doanh thu:</p>
                        <p className="text-3xl font-bold text-green-600">
                            {totalRevenue.toLocaleString()} VND
                        </p>
                    </Card>

                    {/* Biểu đồ doanh thu */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-purple-700">
                                Doanh thu theo {revenueView}
                            </h2>
                            <div className="flex gap-2">
                                {(["day", "month", "year"] as const).map((view) => (
                                    <Button
                                        key={view}
                                        variant={revenueView === view ? "default" : "outline"}
                                        className={
                                            revenueView === view
                                                ? "bg-purple-600 text-white"
                                                : "border-purple-600 text-purple-600"
                                        }
                                        onClick={() => setRevenueView(view)}
                                    >
                                        {view === "day" ? "Ngày" : view === "month" ? "Tháng" : "Năm"}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={revenueData}
                                onClick={(e: any) => {
                                    if (!e || !e.activeLabel) return;
                                    setSelectedLabel(e.activeLabel);
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => `${value.toLocaleString()} VND`}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Doanh thu"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: "#10B981" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Trạng thái giao dịch PieChart */}
                    <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
                        <h2 className="text-lg font-semibold text-purple-700 mb-4">
                            Tỷ lệ trạng thái giao dịch
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Completed", value: transactions.filter(t => t.status === "completed").length },
                                        { name: "Processing", value: transactions.filter(t => t.status === "processing").length },
                                        { name: "Failed", value: transactions.filter(t => t.status === "failed").length },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={100}
                                    label={(props) => `${props.name} (${props.percent?.toFixed(1)}%)`}
                                >
                                    {transactions.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
}