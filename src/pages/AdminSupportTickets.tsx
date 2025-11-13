import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface SupportTicket {
    id: string;
    userId: string;
    category: string;
    subject: string;
    description: string;
    status: string;
    createdAt: string;
    closedAt?: string;
    reply?: string;
}

export default function AdminSupportTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [response, setResponse] = useState("");
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<"all" | "opened" | "resolved">("all");
    const perPage = 10;

    // Lấy danh sách ticket
    const fetchTickets = async () => {
        try {
            const res = await api.get("/support-tickets");
            setTickets(res.data.data || []);
        } catch {
            toast.error("Không thể tải danh sách hỗ trợ!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 8000);
        return () => clearInterval(interval);
    }, []);

    // Xem chi tiết ticket
    const viewDetail = async (id: string) => {
        try {
            const res = await api.get(`/support-tickets/${id}`);
            setSelected(res.data.data);
        } catch {
            toast.error("Không thể tải chi tiết yêu cầu!");
        }
    };

    // Gửi phản hồi admin
    const handleReply = async () => {
        if (!selected) return;
        if (!response.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi!");
            return;
        }
        try {
            await api.patch(`/support-tickets/${selected.id}`, {
                status: "resolved",
                reason: "Đã giải quyết vấn đề",
                reply: response,
            });
            toast.success("✅ Đã gửi phản hồi!");
            setResponse("");
            setSelected(null);
            fetchTickets();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể gửi phản hồi!");
        }
    };

    // Phân trang + Lọc
    const filteredTickets =
        statusFilter === "all"
            ? tickets
            : tickets.filter((t) => t.status === statusFilter);

    const totalPages = Math.ceil(filteredTickets.length / perPage);
    const paginatedTickets = filteredTickets.slice((page - 1) * perPage, page * perPage);

    if (loading) return <p>Đang tải...</p>;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#38A3A5]">
                🧾 Quản lý yêu cầu hỗ trợ khách hàng
            </h2>

            {tickets.length === 0 ? (
                <p>Không có yêu cầu hỗ trợ nào.</p>
            ) : (
                <>
                    <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                        <thead className="bg-[#E6F7F7]">
                            <tr>
                                <th className="py-2 px-3 text-left w-[140px]">Người dùng</th>
                                <th className="py-2 px-3 text-left w-[180px]">Danh mục</th>
                                <th className="py-2 px-3 text-left w-[200px]">Tiêu đề</th>
                                <th className="py-2 px-3 text-left w-[130px]">
                                    <div className="flex items-center gap-1">
                                        <span>Trạng thái</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-[#d9f0f0]"
                                                >
                                                    <Filter
                                                        className={`h-4 w-4 ${statusFilter === "all"
                                                            ? "text-gray-500"
                                                            : "text-[#38A3A5]"
                                                            }`}
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => setStatusFilter("all")}
                                                    className={`text-sm ${statusFilter === "all"
                                                        ? "bg-[#E6F7F7] font-medium text-[#38A3A5]"
                                                        : ""
                                                        }`}
                                                >
                                                    Tất cả
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setStatusFilter("opened")}
                                                    className={`text-sm ${statusFilter === "opened"
                                                        ? "bg-[#FFF9E6] font-medium text-yellow-700"
                                                        : ""
                                                        }`}
                                                >
                                                    Đang mở
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setStatusFilter("resolved")}
                                                    className={`text-sm ${statusFilter === "resolved"
                                                        ? "bg-[#E6F7F7] font-medium text-green-700"
                                                        : ""
                                                        }`}
                                                >
                                                    Đã giải quyết
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </th>

                                <th className="py-2 px-3 text-left w-[160px]">Ngày tạo</th>
                                <th className="py-2 px-3 text-center w-[140px]">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedTickets.map((t) => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-3 text-gray-800">{t.userId.slice(0, 8)}</td>
                                    <td className="py-2 px-3">{t.category}</td>
                                    <td className="py-2 px-3">{t.subject}</td>
                                    <td className="py-2 px-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === "opened"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : t.status === "resolved"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {t.status === "opened"
                                                ? "Đang mở"
                                                : t.status === "resolved"
                                                    ? "Đã giải quyết"
                                                    : "Không xác định"}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3">
                                        {new Date(t.createdAt).toLocaleTimeString("vi-VN")}{" "}
                                        {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => viewDetail(t.id)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            Tổng số yêu cầu: {filteredTickets.length} / {tickets.length}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Trước
                            </Button>
                            <span className="px-3 py-1 text-sm">
                                Trang {page} / {totalPages || 1}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* 🔍 Hộp thoại chi tiết */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>🗨️ Chi tiết yêu cầu hỗ trợ</DialogTitle>
                        <DialogDescription>
                            {selected?.status === "resolved"
                                ? "Thông tin phản hồi đã được lưu."
                                : "Nhập phản hồi để giải quyết yêu cầu này."}
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-3 text-sm">
                            <p><strong>Người dùng:</strong> {selected.userId.slice(0, 8)}</p>
                            <p><strong>Danh mục:</strong> {selected.category}</p>
                            <p><strong>Tiêu đề:</strong> {selected.subject}</p>
                            <p><strong>Mô tả:</strong> {selected.description}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(selected.createdAt).toLocaleString("vi-VN")}</p>

                            {selected.status === "resolved" ? (
                                <>
                                    <p><strong>Trạng thái:</strong> Đã giải quyết</p>
                                    {selected.closedAt && (
                                        <p><strong>Ngày xử lý:</strong> {new Date(selected.closedAt).toLocaleString("vi-VN")}</p>
                                    )}
                                    <div className="bg-[#e8f6f6] p-3 rounded-lg">
                                        <p className="text-[#2d898a] font-medium mb-1">
                                            🧩 Phản hồi của Admin:
                                        </p>
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {selected.reply}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Textarea
                                        placeholder="Nhập nội dung phản hồi cho người dùng..."
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        rows={4}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setSelected(null)}>
                                            Đóng
                                        </Button>
                                        <Button
                                            className="bg-[#38A3A5] hover:bg-[#2d898a]"
                                            onClick={handleReply}
                                        >
                                            Gửi phản hồi
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
