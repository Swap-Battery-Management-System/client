// ====================== 🧩 IMPORT CẦN THIẾT ======================
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

// ====================== 📦 KIỂU DỮ LIỆU ======================
interface SupportTicket {
    id: string;
    userId: string;
    category: string;
    subject: string;
    description: string;
    status: string;
    createdAt: string;
    closedAt?: string | null;
}

// ====================== 🧭 COMPONENT CHÍNH ======================
export default function SupportHistoryPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
        null
    );

    // ====================== 🔄 FETCH DỮ LIỆU ======================
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await api.get("/support-tickets");
                // Nếu muốn lọc ticket theo user hiện tại
                const userTickets = res.data.data.filter(
                    (t: SupportTicket) => t.userId === user?.id
                );
                setTickets(userTickets);
            } catch (err) {
                console.error("❌ Lỗi khi tải ticket:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [user?.id]);

    // ====================== 🎨 RENDER GIAO DIỆN ======================
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📜 Lịch sử hỗ trợ
            </h2>

            {loading ? (
                <div className="flex justify-center items-center h-40 text-gray-500">
                    <Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...
                </div>
            ) : tickets.length === 0 ? (
                <p className="text-gray-500">Bạn chưa có yêu cầu hỗ trợ nào.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left">
                                <th className="px-4 py-2 font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-2 font-semibold text-gray-700">
                                    Danh mục
                                </th>
                                <th className="px-4 py-2 font-semibold text-gray-700">
                                    Tiêu đề
                                </th>
                                <th className="px-4 py-2 font-semibold text-gray-700">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-2 font-semibold text-gray-700">
                                    Ngày tạo
                                </th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-800">{ticket.id}</td>
                                    <td className="px-4 py-2">{ticket.category}</td>
                                    <td className="px-4 py-2 truncate max-w-[200px]">
                                        {ticket.subject}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Badge
                                            variant={
                                                ticket.status === "open"
                                                    ? "default"
                                                    : ticket.status === "closed"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                        >
                                            {ticket.status === "open" ? "Đang mở" : "Đã đóng"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2">
                                        {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ====================== 📋 DIALOG CHI TIẾT ====================== */}
            <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chi tiết yêu cầu hỗ trợ</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-3 text-sm">
                            <p>
                                <strong>Mã yêu cầu:</strong> {selectedTicket.id}
                            </p>
                            <p>
                                <strong>Danh mục:</strong> {selectedTicket.category}
                            </p>
                            <p>
                                <strong>Tiêu đề:</strong> {selectedTicket.subject}
                            </p>
                            <p>
                                <strong>Mô tả:</strong> {selectedTicket.description}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong>{" "}
                                {selectedTicket.status === "open" ? "Đang mở" : "Đã đóng"}
                            </p>
                            <p>
                                <strong>Ngày tạo:</strong>{" "}
                                {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
                            </p>
                            {selectedTicket.closedAt && (
                                <p>
                                    <strong>Ngày đóng:</strong>{" "}
                                    {new Date(selectedTicket.closedAt).toLocaleString("vi-VN")}
                                </p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
