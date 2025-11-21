import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

export default function PaymentResult() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [invoiceId, setInvoiceId] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const query = window.location.search;

                // Detect gateway từ URL
                const path = window.location.pathname.toLowerCase();
                const gateway = path.includes("momo")
                    ? "momo"
                    : path.includes("payos")
                        ? "payos"
                        : "vnpay";

                // ❗verify là public → phải dùng axios thường, không dùng api instance
                const res = await axios.get(
                    `${API_URL}/payments/${gateway}/verify${query}`
                );

                const data = res.data;

                // Fallback invoice
                const fallbackInvoice =
                    data.data?.invoiceId && data.data.invoiceId !== "unknown"
                        ? data.data.invoiceId
                        : params.get("vnp_TxnRef") ||
                        params.get("orderCode") ||
                        params.get("invoiceId") ||
                        "";

                // Fallback amount
                const fallbackAmount =
                    data.data?.amountTotal ||
                    Number(params.get("vnp_Amount")) / 100 ||
                    Number(params.get("amount")) ||
                    0;

                setInvoiceId(fallbackInvoice);
                setAmount(fallbackAmount);
                setSuccess(data.success);
                setMessage(data.message);

                if (data.success) toast.success("Thanh toán thành công!");
                else toast.error("Thanh toán thất bại!");
            } catch (err) {
                console.error("❌ Lỗi verify:", err);
                toast.error("Không thể xác minh thanh toán!");
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, []);

    if (loading)
        return <p className="text-center mt-10 text-gray-500">⏳ Đang xác minh giao dịch...</p>;

    return (
        <div className="max-w-lg mx-auto p-6 text-center bg-white shadow-md mt-10 rounded-xl">
            {success ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-3">
                        🎉 Thanh toán thành công!
                    </h2>
                    <p>Mã hóa đơn: <b>{invoiceId || "Không xác định"}</b></p>
                    <p>Số tiền: <b>{amount.toLocaleString("vi-VN")}₫</b></p>
                    <p className="text-gray-500 mt-2">{message}</p>

                    <Button
                        className="mt-5 bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                        onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                    >
                        Xem hóa đơn
                    </Button>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-3">
                        ❌ Giao dịch thất bại
                    </h2>

                    <p className="text-gray-600 mb-4">
                        {message || "Không xác định được thông tin thanh toán."}
                    </p>

                    <div className="flex justify-center gap-4 mt-5">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                        >
                            🔍 Xem hóa đơn
                        </Button>

                        <Button
                            className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                            onClick={() =>
                                navigate("/home/payment", {
                                    state: { invoiceId, amount },
                                })
                            }
                        >
                            💳 Chọn lại phương thức thanh toán
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
