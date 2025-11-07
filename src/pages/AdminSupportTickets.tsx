import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminSupportTickets() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            const res = await api.get("/support-tickets");
            setTickets(res.data.data || []);
        } catch (err) {
            toast.error("Không thể tải danh sách hỗ trợ!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCloseTicket = async (id: string) => {
        try {
            await api.patch(`/support-tickets/${id}`, {
                status: "closed",
                closedAt: new Date().toISOString(),
            });
            toast.success("Đã đóng ticket!");
            fetchTickets();
        } catch (err) {
            toast.error("Không thể cập nhật trạng thái!");
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#38A3A5]">
                🧾 Trung tâm hỗ trợ khách hàng
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
                            <th className="py-2 px-3 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((t) => (
                            <tr key={t.id} className="border-b">
                                <td className="py-2 px-3">{t.userId}</td>
                                <td className="py-2 px-3">{t.category}</td>
                                <td className="py-2 px-3">{t.subject}</td>
                                <td className="py-2 px-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === "open"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {t.status}
                                    </span>
                                </td>
                                <td className="py-2 px-3">
                                    {new Date(t.createdAt).toLocaleString()}
                                </td>
                                <td className="py-2 px-3">
                                    {t.status === "open" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCloseTicket(t.id)}
                                        >
                                            Đóng
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
