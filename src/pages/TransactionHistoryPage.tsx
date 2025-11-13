import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Invoice {
    id: string;
    type: string;
    status: string;
    amountTotal: string;
    createdAt: string;
    user: { fullName: string; email: string };
    booking?: { scheduleTime?: string };
}

export default function TransactionHistoryPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.get("/invoices?page=1&limit=10");
                setInvoices(res.data.data.invoices || []);
            } catch (err) {
                console.error("Lỗi tải hóa đơn:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    if (loading)
        return (
            <p className="text-center text-gray-500 mt-8">⏳ Đang tải danh sách hóa đơn...</p>
        );

    return (
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-[#38A3A5] mb-4 text-center">
                🧾 LỊCH SỬ GIAO DỊCH
            </h2>

            {invoices.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có hóa đơn nào</p>
            ) : (
                <table className="w-full text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-2 text-left">Mã hóa đơn</th>
                            <th className="border px-2 py-2 text-left">Khách hàng</th>
                            <th className="border px-2 py-2 text-left">Ngày tạo</th>
                            <th className="border px-2 py-2 text-center">Trạng thái</th>
                            <th className="border px-2 py-2 text-right">Tổng tiền (₫)</th>
                            <th className="border px-2 py-2 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50 transition">
                                <td className="border px-2 py-2">{inv.id.slice(0, 8).toUpperCase()}</td>
                                <td className="border px-2 py-2">
                                    <div>
                                        <p>{inv.user.fullName}</p>
                                        <p className="text-xs text-gray-500">{inv.user.email}</p>
                                    </div>
                                </td>
                                <td className="border px-2 py-2">
                                    {new Date(inv.createdAt).toLocaleString("vi-VN")}
                                </td>
                                <td className="border px-2 py-2 text-center">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${inv.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : inv.status === "processing"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {inv.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="border px-2 py-2 text-right font-semibold text-gray-700">
                                    {Number(inv.amountTotal).toLocaleString("vi-VN")}
                                </td>
                                <td className="border px-2 py-2 text-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/home/invoice/${inv.id}`, { state: { id: inv.id } })
                                        }
                                    >
                                        🔍 Xem chi tiết
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
