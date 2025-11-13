import { useEffect, useState } from "react";
import { Bell, Trash2, Undo2, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";

// ================= ENUM FIX =================
export const NotificationType = {
    SYSTEM: "system",
    USER: "user",
    STATION: "station",
    ALERT: "alert",
} as const;
export type NotificationType =
    (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationSendType = {
    IMMEDIATE: "immediate",
    SCHEDULED: "scheduled",
} as const;
export type NotificationSendType =
    (typeof NotificationSendType)[keyof typeof NotificationSendType];

// ================= INTERFACE =================
interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    sendType: NotificationSendType;
    createdDate: string;
    status: string;
    sendTime?: string;
    userId?: string;
    stationsId?: string[];
}

// ================= COMPONENT =================
export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selected, setSelected] = useState<Notification | null>(null);

    // 📄 Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = notifications.slice(startIndex, startIndex + itemsPerPage);

    // 🔄 Lấy danh sách thông báo
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data?.data?.notifications || []);
        } catch (err) {
            toast.error("Không thể tải danh sách thông báo!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // 🚫 Thu hồi
    const handleRetract = async (id: string) => {
        if (!confirm("Thu hồi thông báo này?")) return;
        try {
            await api.delete(`/notifications/${id}/retract`);
            toast.success("Thông báo đã được thu hồi!");
            fetchNotifications();
        } catch (err) {
            toast.error("Không thể thu hồi!");
            console.error(err);
        }
    };

    // ❌ Xóa hoàn toàn
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa hoàn toàn thông báo này?")) return;
        try {
            await api.delete(`/notifications/${id}`);
            toast.success("Đã xóa thông báo!");
            fetchNotifications();
        } catch (err) {
            toast.error("Không thể xóa!");
            console.error(err);
        }
    };

    // ================== JSX ==================
    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* ===== Header ===== */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-600">
                    <Bell className="w-6 h-6" /> Quản lý thông báo
                </h1>
                <Button
                    onClick={() => setOpenCreate(true)}
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md hover:from-cyan-600 hover:to-emerald-600"
                >
                    <Send className="w-4 h-4 mr-2" /> Tạo thông báo
                </Button>
            </div>

            {/* ===== Main Table ===== */}
            {loading ? (
                <p className="text-gray-500 animate-pulse">Đang tải...</p>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    Chưa có thông báo nào.
                </div>
            ) : (
                <>
                    <table className="min-w-full border bg-white rounded-xl overflow-hidden shadow-sm">
                        <thead className="bg-emerald-50 text-emerald-700">
                            <tr>
                                <th className="p-3 text-left">Tiêu đề</th>
                                <th className="p-3 text-left">Loại</th>
                                <th className="p-3 text-left">Kiểu gửi</th>
                                <th className="p-3 text-left">Thời gian tạo</th>
                                <th className="p-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((n) => (
                                <tr
                                    key={n.id}
                                    className="border-b hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-3">{n.title || "(Không có tiêu đề)"}</td>
                                    <td className="p-3 capitalize">{n.type}</td>
                                    <td className="p-3 capitalize">{n.sendType}</td>
                                    <td className="p-3 text-sm text-gray-500">
                                        {n.createdDate
                                            ? new Date(n.createdDate).toLocaleString("vi-VN")
                                            : "—"}
                                    </td>
                                    <td className="p-3 flex gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelected(n);
                                                setOpenDetail(true);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRetract(n.id)}
                                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                        >
                                            <Undo2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(n.id)}
                                            className="text-rose-600 border-rose-300 hover:bg-rose-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ===== Pagination ===== */}
                    {notifications.length > 0 && (
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                            <p>
                                Tổng số thông báo: {notifications.length} | Trang {currentPage} / {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ===== Dialog: Chi tiết ===== */}
            <Dialog open={openDetail} onOpenChange={setOpenDetail}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chi tiết thông báo</DialogTitle>
                    </DialogHeader>
                    {selected ? (
                        <div className="space-y-2 text-sm">
                            <p><b>Tiêu đề:</b> {selected.title}</p>
                            <p><b>Nội dung:</b> {selected.message}</p>
                            <p><b>Loại:</b> {selected.type}</p>
                            <p><b>Kiểu gửi:</b> {selected.sendType}</p>
                            {selected.sendTime && (
                                <p>
                                    <b>Thời gian gửi:</b>{" "}
                                    {new Date(selected.sendTime).toLocaleString("vi-VN")}
                                </p>
                            )}
                            <p>
                                <b>Thời gian tạo:</b>{" "}
                                {selected.createdDate
                                    ? new Date(selected.createdDate).toLocaleString("vi-VN")
                                    : "—"}
                            </p>
                            <p>
                                <b>Trạng thái:</b> {selected.status || "active"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Không có dữ liệu.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
