"use client";


import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import api from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Station {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  stationId: string;
}

interface Invoice {
  id: string;
  bookingId: string;
}

interface Transaction {
  id: string;
  invoiceId: string;
  totalAmount: string;
  status: string;
}

export default function ManagerRevenueManagement() {
  const [stations, setStations] = useState<Station[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const [stationRevenue, setStationRevenue] = useState<{ station: string; revenue: number }[]>([]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Fetch dữ liệu đồng thời
      const [stationsRes, transactionsRes, invoicesRes, bookingsRes] = await Promise.all([
        api.get("/stations", { withCredentials: true }),
        api.get("/transactions", { withCredentials: true }),
        api.get("/invoices", { withCredentials: true }),
        api.get("/bookings", { withCredentials: true }),
      ]);

      const stationsApi: Station[] = stationsRes.data?.data?.stations || [];
      const transactionsApi: Transaction[] = transactionsRes.data?.data?.transactions || [];
      const invoicesApi: Invoice[] = invoicesRes.data?.data?.invoices || [];
      const bookingsApi: Booking[] = bookingsRes.data?.data?.bookings || [];

      setStations(stationsApi);
      setTransactions(transactionsApi);
      setInvoices(invoicesApi);
      setBookings(bookingsApi);

      // Map invoiceId -> booking
      const invoiceIdToBooking: Record<string, Booking> = {};
      invoicesApi.forEach(inv => {
        const booking = bookingsApi.find(b => b.id === inv.bookingId);
        if (booking) invoiceIdToBooking[inv.id] = booking;
      });

      // Tính doanh thu theo station
      const revenueMap: Record<string, number> = {};
      transactionsApi.forEach(tx => {
        if (tx.status.toLowerCase() !== "completed") return;
        const booking = invoiceIdToBooking[tx.invoiceId];
        if (!booking) return;
        const station = stationsApi.find(s => s.id === booking.stationId);
        if (!station) return;
        revenueMap[station.name] = (revenueMap[station.name] || 0) + Number(tx.totalAmount);
      });

      const revenueArray = Object.entries(revenueMap).map(([station, revenue]) => ({
        station,
        revenue,
      }));

      setStationRevenue(revenueArray);
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
      toast.error("Không thể tải dữ liệu doanh thu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#5B21B6]">Báo cáo doanh thu theo trạm</h1>
        <Button
          onClick={fetchRevenueData}
          className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 mt-24 animate-pulse text-lg">
          Đang tải dữ liệu doanh thu...
        </div>
      ) : stationRevenue.length === 0 ? (
        <div className="text-center text-gray-400 mt-24 text-lg">
          Chưa có dữ liệu doanh thu
        </div>
      ) : (
        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={stationRevenue}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="station" angle={-45} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip formatter={(value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#4ADE80" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
