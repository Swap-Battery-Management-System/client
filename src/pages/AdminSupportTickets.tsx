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
    const [reason, setReason] = useState("");
    const [solution, setSolution] = useState("");

    // 🔄 Lấy danh sách ticket
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

    // 👁️ Xem chi tiết ticket
    const viewDetail = async (id: string) => {
        try {
            const res = await api.get(`/support-tickets/${id}`);
            setSelected(res.data.data);
        } catch {
            toast.error("Không thể tải chi tiết yêu cầu!");
        }
    };
    // 💬 Gửi phản hồi (UPDATE)
    const handleReply = async () => {
        if (!selected) return;

        if (!reason.trim() || !solution.trim()) {
            toast.error("Vui lòng nhập đầy đủ Lý do và Giải pháp!");
            return;
        }

        try {
            await api.patch(`/support-tickets/${selected.id}`, {
                status: "resolved",
                reason: reason.trim(),
                solution: solution.trim(),
            });
            toast.success("✅ Đã gửi phản hồi và cập nhật trạng thái!");
            setReason("");
            setSolution("");
            setSelected(null);
            fetchTickets();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể gửi phản hồi!");
            console.error(err);
        }
    };


    // 📄 Lọc + phân trang
    const filteredTickets =
        statusFilter === "all"
            ? tickets
            : tickets.filter((t) => t.status === statusFilter);

    const totalPages = Math.ceil(filteredTickets.length / perPage);
    const paginatedTickets = filteredTickets.slice((page - 1) * perPage, page * perPage);

    if (loading)
        return <p className="text-gray-500 animate-pulse text-center mt-10">Đang tải dữ liệu...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* ===== Header ===== */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-600">
                    🧾 Quản lý yêu cầu hỗ trợ
                </h1>
            </div>

            {/* ===== Main Table ===== */}
            {tickets.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    Chưa có yêu cầu hỗ trợ nào.
                </div>
            ) : (
                <>
                    <table className="min-w-full border bg-white rounded-xl overflow-hidden shadow-sm">
                        <thead className="bg-emerald-50 text-emerald-700">
                            <tr>
                                <th className="p-3 text-left w-[140px]">Người dùng</th>
                                <th className="p-3 text-left w-[180px]">Danh mục</th>
                                <th className="p-3 text-left w-[220px]">Tiêu đề</th>
                                <th className="p-3 text-left w-[130px]">
                                    <div className="flex items-center gap-1">
                                        <span>Trạng thái</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-emerald-50"
                                                >
                                                    <Filter
                                                        className={`h-4 w-4 ${statusFilter === "all"
                                                            ? "text-gray-500"
                                                            : "text-emerald-600"
                                                            }`}
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => setStatusFilter("all")}
                                                    className={`text-sm ${statusFilter === "all"
                                                        ? "bg-emerald-50 font-medium text-emerald-600"
                                                        : ""
                                                        }`}
                                                >
                                                    Tất cả
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setStatusFilter("opened")}
                                                    className={`text-sm ${statusFilter === "opened"
                                                        ? "bg-yellow-50 font-medium text-yellow-700"
                                                        : ""
                                                        }`}
                                                >
                                                    Đang mở
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setStatusFilter("resolved")}
                                                    className={`text-sm ${statusFilter === "resolved"
                                                        ? "bg-green-50 font-medium text-green-700"
                                                        : ""
                                                        }`}
                                                >
                                                    Đã giải quyết
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </th>
                                <th className="p-3 text-left w-[160px]">Ngày tạo</th>
                                <th className="p-3 text-center w-[140px]">Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedTickets.map((t) => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-gray-800">{t.userId.slice(0, 8)}</td>
                                    <td className="p-3">{t.category}</td>
                                    <td className="p-3">{t.subject}</td>
                                    <td className="p-3">
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
                                    <td className="p-3 text-sm text-gray-600">
                                        {new Date(t.createdAt).toLocaleString("vi-VN")}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => viewDetail(t.id)}
                                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                        >
                                            Xem
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ===== Pagination ===== */}
                    {filteredTickets.length > 0 && (
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                            <p>
                                Tổng số yêu cầu: {filteredTickets.length} / {tickets.length}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === totalPages || totalPages === 0}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {/* ===== Dialog Chi tiết ===== */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Chi tiết yêu cầu hỗ trợ</DialogTitle>
                        <DialogDescription>
                            {selected?.status === "resolved"
                                ? "Thông tin phản hồi của admin."
                                : "Nhập lý do và giải pháp để giải quyết yêu cầu này."}
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
                                    <div className="bg-emerald-50 p-3 rounded-lg">
                                        <p className="text-emerald-700 font-medium mb-1">🧩 Phản hồi của Admin:</p>
                                        <p className="text-gray-700 whitespace-pre-line">{selected.reply}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-emerald-700">
                                            🧠 Lý do
                                        </label>
                                        <Textarea
                                            placeholder="Nhập lý do..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-emerald-700">
                                            🔧 Giải pháp
                                        </label>
                                        <Textarea
                                            placeholder="Nhập giải pháp..."
                                            value={solution}
                                            onChange={(e) => setSolution(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 mt-3">
                                        <Button variant="outline" onClick={() => setSelected(null)}>
                                            Đóng
                                        </Button>
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
