import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

export default function TransactionHistory() {
    const { user } = useAuth();
    const userId = user?.id;

    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [status, setStatus] = useState("");
    const [methodId, setMethodId] = useState("");

    const [page, setPage] = useState(1);
    const limit = 10;

    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    // Modal xem chi tiết
    const [selectedTx, setSelectedTx] = useState<any>(null);

    // ======= FORMAT ==========
    const formatCurrency = (v: any) =>
        Number(v).toLocaleString("vi-VN") + " đ";
    const formatDate = (d: string) =>
        new Date(d).toLocaleString("vi-VN", { hour12: false });

    // ===== GET PAYMENT METHODS =====
    const fetchPaymentMethods = async () => {
        try {
            const res = await api.get("/payment-methods");
            setPaymentMethods(res.data.data || []);
        } catch {
            toast.error("Không thể tải phương thức thanh toán");
        }
    };

    // ===== FETCH TRANSACTIONS =====
    const fetchTransactions = async () => {
        if (!userId) return;
        try {
            setLoading(true);

            const res = await api.get("/transactions", {
                params: {
                    userId,
                    status: status || undefined,
                    methodId: methodId || undefined,
                    page,
                    limit,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                },
            });

            setTransactions(res.data.data?.transactions || []);
        } catch (err) {
            toast.error("Không thể tải giao dịch");
        } finally {
            setLoading(false);
        }
    };

    // Load methods on mount
    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    // Load transactions on filter change
    useEffect(() => {
        fetchTransactions();
    }, [status, methodId, page]);

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#38A3A5] text-center">
                Lịch sử giao dịch
            </h2>

            {/* FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded shadow">

                {/* TRẠNG THÁI */}
                <select
                    value={status}
                    onChange={(e) => {
                        setPage(1);
                        setStatus(e.target.value);
                    }}
                    className="border rounded px-3 py-2"
                >
                    <option value="">-- Trạng thái --</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="failed">Thất bại</option>
                    <option value="refunded">Hoàn tiền</option>
                    <option value="canceled">Đã hủy</option>
                </select>

                {/* PHƯƠNG THỨC THANH TOÁN */}
                <select
                    value={methodId}
                    onChange={(e) => {
                        setPage(1);
                        setMethodId(e.target.value);
                    }}
                    className="border rounded px-3 py-2"
                >
                    <option value="">-- Phương thức thanh toán --</option>
                    {paymentMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>

                {/* RESET FILTER */}
                <Button
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => {
                        setStatus("");
                        setMethodId("");
                        setPage(1);
                        fetchTransactions();
                    }}
                >
                    Reset bộ lọc
                </Button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg bg-white shadow">
                <table className="table-auto w-full text-center border-collapse">
                    <thead className="bg-[#E6F7F7] text-[#38A3A5]">
                        <tr>
                            <th className="border px-2 py-2">STT</th>
                            <th className="border px-2 py-2">Mã GD</th>
                            <th className="border px-2 py-2">Mã đơn hàng</th>
                            <th className="border px-2 py-2">Phương thức</th>
                            <th className="border px-2 py-2">Số tiền</th>
                            <th className="border px-2 py-2">Ngày</th>
                            <th className="border px-2 py-2">Trạng thái</th>
                            <th className="border px-2 py-2">Xem</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="py-4 text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-4 text-gray-500">
                                    Không có giao dịch
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx, i) => (
                                <tr key={tx.id} className="border-b hover:bg-gray-100">
                                    <td>{(page - 1) * limit + i + 1}</td>
                                    <td>{tx.id.slice(0, 8)}</td>

                                    {/* MÃ ĐƠN HÀNG (invoiceId) */}
                                    <td>{tx.invoice?.id.slice(0, 8) || "—"}</td>

                                    {/* PAYMENT METHOD */}
                                    <td className="flex items-center justify-center gap-2 py-2">
                                        {tx.paymentMethod?.iconUrl && (
                                            <img
                                                src={tx.paymentMethod.iconUrl}
                                                className="w-6 h-6 rounded"
                                            />
                                        )}
                                        {tx.paymentMethod?.name}
                                    </td>

                                    <td className="font-semibold text-green-700">
                                        {formatCurrency(tx.totalAmount)}
                                    </td>

                                    <td>{formatDate(tx.createdAt)}</td>

                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded text-sm ${tx.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : tx.status === "failed"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {tx.status}
                                        </span>
                                    </td>

                                    <td>
                                        <Button
                                            className="bg-[#38A3A5] text-white"
                                            onClick={() => setSelectedTx(tx)}
                                        >
                                            Xem
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center gap-4 mt-4">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    ← Trước
                </Button>

                <Button onClick={() => setPage((p) => p + 1)}>
                    Sau →
                </Button>
            </div>

            {/* MODAL CHI TIẾT */}
            <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
                <DialogContent className="p-6 sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#38A3A5]">
                            Chi tiết giao dịch
                        </DialogTitle>
                    </DialogHeader>

                    {selectedTx && (
                        <div className="space-y-2 text-sm">
                            <p><strong>Mã giao dịch:</strong> {selectedTx.id}</p>
                            <p><strong>Invoice:</strong> {selectedTx.invoice?.id}</p>
                            <p><strong>Số tiền:</strong> {formatCurrency(selectedTx.totalAmount)}</p>
                            <p><strong>Trạng thái:</strong> {selectedTx.status}</p>
                            <p><strong>Ngày tạo:</strong> {formatDate(selectedTx.createdAt)}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
