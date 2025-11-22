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
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
    reply?: string;
}

// ====================== 🧩 HÀM TRỢ GIÚP ======================
const getStatusLabel = (status: string) => {
    switch (status) {
        case "opened":
            return { label: "Đang chờ giải quyết", variant: "outline" };
        case "resolved":
            return { label: "Đã giải quyết", variant: "secondary" };
        default:
            return { label: "Không xác định", variant: "outline" };
    }
};

// ====================== 🧭 COMPONENT CHÍNH ======================
export default function SupportHistoryPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
        null
    );

    // 🔍 Tìm kiếm
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    // ➕ Dialog tạo ticket mới
    const [openCreate, setOpenCreate] = useState(false);
    const [form, setForm] = useState({ category: "", subject: "", description: "" });
    const [sending, setSending] = useState(false);

    // ====================== 🔄 FETCH DỮ LIỆU ======================
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get("/support-tickets");
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

    useEffect(() => {
        fetchTickets();
    }, [user?.id]);

    // ====================== ✉️ GỬI YÊU CẦU HỖ TRỢ ======================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.subject || !form.description) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và mô tả!");
            return;
        }
        try {
            setSending(true);
            const res = await api.post("/support-tickets", {
                userId: user?.id,
                category: form.category || "Khác",
                subject: form.subject,
                description: form.description,
                status: "opened",
            });
            toast.success("🎉 Gửi yêu cầu hỗ trợ thành công!");
            setForm({ category: "", subject: "", description: "" });
            setOpenCreate(false);
            fetchTickets(); // ✅ reload sau khi tạo
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể gửi yêu cầu!");
        } finally {
            setSending(false);
        }
    };

    // ====================== 🎨 RENDER GIAO DIỆN ======================
    const filteredTickets = tickets.filter((t) =>
        t.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* 🔹 Thanh tiêu đề + chức năng */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-[#38A3A5]">
                    📜 Lịch sử hỗ trợ
                </h2>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Tìm theo tiêu đề..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-[220px]"
                        />
                    </div>

                    <Button
                        onClick={fetchTickets}
                        variant="outline"
                        className="flex items-center gap-2 text-[#38A3A5] border-[#38A3A5] hover:bg-[#e8f6f6]"
                    >
                        <RefreshCw size={16} /> Làm mới
                    </Button>

                    <Button
                        onClick={() => navigate("/home/support")}
                        className="flex items-center gap-2 bg-[#38A3A5] hover:bg-[#2d898a] text-white"
                    >
                        <Plus size={16} /> Tạo đơn hỗ trợ
                    </Button>
                </div>
            </div>

            {/* 🔄 Hiển thị bảng */}
            {loading ? (
                <div className="flex justify-center items-center h-40 text-gray-500">
                    <Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...
                </div>
            ) : filteredTickets.length === 0 ? (
                <p className="text-gray-500">Không tìm thấy yêu cầu hỗ trợ nào.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-[#f5fafa]">
                            <tr className="text-left text-[#2d898a]">
                                <th className="px-4 py-2 font-semibold">Danh mục</th>
                                <th className="px-4 py-2 font-semibold">Tiêu đề</th>
                                <th className="px-4 py-2 font-semibold">Mô tả</th>
                                <th className="px-4 py-2 font-semibold">Trạng thái</th>
                                <th className="px-4 py-2 font-semibold">Ngày tạo</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTickets.map((ticket) => {
                                const { label, variant } = getStatusLabel(ticket.status);
                                const isOpened = ticket.status === "opened";
                                return (
                                    <tr key={ticket.id} className="hover:bg-[#f7fdfd]">
                                        <td className="px-4 py-2">{ticket.category}</td>
                                        <td className="px-4 py-2 truncate max-w-[160px] font-medium">
                                            {ticket.subject}
                                        </td>
                                        <td className="px-4 py-2 truncate max-w-[220px] text-gray-600">
                                            {ticket.description}
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge
                                                className={
                                                    isOpened
                                                        ? "bg-[#e0f7f5] text-[#2d898a]"
                                                        : "bg-[#f1f3f4] text-gray-600"
                                                }
                                            >
                                                {label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2">
                                            {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => setSelectedTicket(ticket)}
                                                className={
                                                    isOpened
                                                        ? "bg-[#38A3A5] hover:bg-[#2d898a] text-white"
                                                        : "bg-[#17a145] hover:bg-[#8ac4c4] text-white"
                                                }
                                            >
                                                {isOpened
                                                    ? "Đang chờ giải quyết"
                                                    : "Xem chi tiết giải quyết"}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 📋 DIALOG CHI TIẾT */}
            <Dialog
                open={!!selectedTicket}
                onOpenChange={(open) => {
                    if (!open) fetchTickets();
                    setSelectedTicket(open ? selectedTicket : null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTicket?.status === "resolved"
                                ? "📘 Chi tiết giải quyết"
                                : "📨 Yêu cầu đang chờ xử lý"}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-3 text-sm">
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
                                {getStatusLabel(selectedTicket.status).label}
                            </p>
                            {selectedTicket.closedAt && (
                                <p>
                                    <strong>Ngày xử lý:</strong>{" "}
                                    {new Date(selectedTicket.closedAt).toLocaleString("vi-VN")}
                                </p>
                            )}
                            {selectedTicket.status === "resolved" && selectedTicket.reply && (
                                <div className="mt-3 bg-[#e8f6f6] p-3 rounded-md">
                                    <p className="font-medium text-[#2d898a] mb-1">
                                        🧩 Kết quả xử lý:
                                    </p>
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {selectedTicket.reply}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 🆕 DIALOG TẠO ĐƠN HỖ TRỢ */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>📝 Tạo đơn hỗ trợ mới</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            placeholder="Danh mục (VD: Lỗi đặt lịch, Pin, ...)"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                        <Input
                            placeholder="Tiêu đề sự cố *"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            required
                        />
                        <Textarea
                            placeholder="Mô tả chi tiết sự cố *"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            rows={4}
                            required
                        />
                        <Button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-[#38A3A5] hover:bg-[#2d898a]"
                        >
                            {sending ? "Đang gửi..." : "📩 Gửi yêu cầu hỗ trợ"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
