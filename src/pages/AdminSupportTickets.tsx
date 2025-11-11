import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
    adminResponse?: string;
}

export default function AdminSupportTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [response, setResponse] = useState("");

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
    }, []);

    // Cập nhật trạng thái
    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/support-tickets/${id}`, {
                status: newStatus,
                closedAt: newStatus === "closed" ? new Date().toISOString() : null,
            });
            toast.success("Cập nhật trạng thái thành công!");
            fetchTickets();
        } catch {
            toast.error("Không thể cập nhật trạng thái!");
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
                adminResponse: response,
                status: "closed",
                closedAt: new Date().toISOString(),
            });
            toast.success("Đã phản hồi và đóng yêu cầu!");
            setSelected(null);
            setResponse("");
            fetchTickets();
        } catch {
            toast.error("Không thể gửi phản hồi!");
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#38A3A5]">
                🧾 Quản lý yêu cầu hỗ trợ khách hàng
            </h2>

            {tickets.length === 0 ? (
                <p>Không có yêu cầu hỗ trợ nào.</p>
            ) : (
                <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                    <thead className="bg-[#E6F7F7]">
                        <tr>
                            <th className="py-2 px-3 text-left">Người dùng</th>
                            <th className="py-2 px-3 text-left">Danh mục</th>
                            <th className="py-2 px-3 text-left">Tiêu đề</th>
                            <th className="py-2 px-3 text-left">Trạng thái</th>
                            <th className="py-2 px-3 text-left">Ngày tạo</th>
                            <th className="py-2 px-3 text-left text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((t) => (
                            <tr key={t.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3 text-gray-800">{t.userId}</td>
                                <td className="py-2 px-3">{t.category}</td>
                                <td className="py-2 px-3">{t.subject}</td>
                                <td className="py-2 px-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === "open"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : t.status === "in_progress"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {t.status === "open"
                                            ? "Mở"
                                            : t.status === "in_progress"
                                                ? "Đang xử lý"
                                                : "Đã đóng"}
                                    </span>
                                </td>
                                <td className="py-2 px-3">
                                    {new Date(t.createdAt).toLocaleString("vi-VN")}
                                </td>
                                <td className="py-2 px-3 flex gap-2 justify-center">
                                    {t.status === "open" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateStatus(t.id, "in_progress")}
                                        >
                                            Đang xử lý
                                        </Button>
                                    )}
                                    {t.status !== "closed" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelected(t)}
                                        >
                                            Phản hồi
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Hộp thoại phản hồi */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>🗨️ Phản hồi yêu cầu hỗ trợ</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-3">
                            <p>
                                <strong>Danh mục:</strong> {selected.category}
                            </p>
                            <p>
                                <strong>Tiêu đề:</strong> {selected.subject}
                            </p>
                            <p>
                                <strong>Mô tả:</strong> {selected.description}
                            </p>
                            <Textarea
                                placeholder="Nhập nội dung phản hồi cho người dùng..."
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={4}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelected(null)}>
                                    Hủy
                                </Button>
                                <Button
                                    className="bg-[#38A3A5] hover:bg-[#2d898a]"
                                    onClick={handleReply}
                                >
                                    Gửi phản hồi
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
