"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import api from "@/lib/api";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Transaction {
  id: string;
  invoiceId: string;
  totalAmount: number;
  status: "processing" | "completed" | "failed";
  updatedAt: string;
}

export default function ManagerRevenueManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState<"day" | "month" | "year">("day");

  // ==================== Fetch transactions ====================
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("Bắt đầu fetch transactions...");

      const res = await api.get("/transactions", { withCredentials: true });
      const data: Transaction[] = res.data?.data?.transactions || [];

      // Lọc completed và chuyển totalAmount sang number
      const completed = data
        .filter(tx => tx.status === "completed")
        .map(tx => ({
          ...tx,
          totalAmount: Number(tx.totalAmount),
          updatedAt: tx.updatedAt,
        }));

      setTransactions(completed);
      console.log("Transactions completed:", completed);
    } catch (err) {
      console.error("Lỗi khi fetch transactions:", err);
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ==================== Tổng doanh thu ====================
  const totalRevenue = useMemo(
    () => transactions.reduce((sum, t) => sum + t.totalAmount, 0),
    [transactions]
  );

  // ==================== Dữ liệu LineChart ====================
  const revenueData = useMemo(() => {
    if (!transactions.length) return [];

    const counts: Record<string, number> = {};
    transactions.forEach(tx => {
      const key =
        revenueView === "day"
          ? dayjs.utc(tx.updatedAt).format("DD/MM/YYYY")
          : revenueView === "month"
            ? dayjs.utc(tx.updatedAt).format("MM/YYYY")
            : dayjs.utc(tx.updatedAt).format("YYYY");
      counts[key] = (counts[key] || 0) + tx.totalAmount;
    });

    const dates = transactions.map(tx => dayjs.utc(tx.updatedAt));
    const firstDate: Dayjs = dates.reduce((min, d) => (d.isBefore(min) ? d : min), dates[0]).startOf(revenueView);
    const lastDate: Dayjs = dates.reduce((max, d) => (d.isAfter(max) ? d : max), dates[0]).endOf(revenueView);

    const result: { name: string; revenue: number }[] = [];
    let current = firstDate;

    while (current.isSameOrBefore(lastDate, revenueView)) {
      const key =
        revenueView === "day"
          ? current.format("DD/MM/YYYY")
          : revenueView === "month"
            ? current.format("MM/YYYY")
            : current.format("YYYY");

      result.push({ name: key, revenue: counts[key] || 0 });

      current =
        revenueView === "day"
          ? current.add(1, "day")
          : revenueView === "month"
            ? current.add(1, "month")
            : current.add(1, "year");
    }

    return result;
  }, [transactions, revenueView]);

  // ==================== Render ====================
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-purple-700">
          Báo cáo doanh thu
        </h1>
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
              {totalRevenue.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} VND
            </p>
          </Card>

          {/* LineChart */}
          <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-700">
                Doanh thu theo {revenueView}
              </h2>
              <div className="flex gap-2">
                {(["day", "month", "year"] as const).map(view => (
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
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={v => `${v.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} VND`} />
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
        </>
      )}
    </div>
  );
}
