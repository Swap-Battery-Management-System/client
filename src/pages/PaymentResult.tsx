import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

/**
 * 💳 PaymentResult.tsx (3 mã trạng thái: 200, 400, 500)
 * - Phát hiện gateway tự động
 * - Xác minh thanh toán qua API
 * - Hiển thị giao diện theo 3 trạng thái chính
 */
export default function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState<"loading" | "success" | "fail" | "error">(
        "loading"
    );
    const [gateway, setGateway] = useState<string>("unknown");
    const [invoiceId, setInvoiceId] = useState<string>("");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const query = location.search;
                console.log("📩 [PAYMENT RESULT] Query:", query);

                // 🔍 Tự phát hiện gateway
                let endpoint = "";
                if (query.includes("vnp_")) {
                    endpoint = `/payments/vnpay/verify${query}`;
                    setGateway("VNPay");
                } else if (query.includes("orderCode") || query.includes("status=PAID")) {
                    endpoint = `/payments/payos/verify${query}`;
                    setGateway("PayOS");
                } else if (query.includes("resultCode") || query.includes("momo")) {
                    endpoint = `/payments/momo/verify${query}`;
                    setGateway("MoMo");
                } else {
                    toast.error("Không xác định được cổng thanh toán!");
                    setStatus("error");
                    return;
                }

                // Lấy invoiceId (nếu có)
                const params = new URLSearchParams(location.search);
                const inv = params.get("invoiceId");
                if (inv) setInvoiceId(inv);

                // Gọi API xác minh
                const res = await api.get(endpoint);
                console.log("✅ [VERIFY RESPONSE]", res.status, res.data);

                const msg = (res.data?.message || res.data?.data || "")
                    .toString()
                    .toLowerCase();

                // Chỉ 3 trường hợp
                if (res.status === 200 && msg.includes("success")) {
                    setStatus("success");
                    toast.success("Thanh toán thành công!");
                } else if (res.status === 400) {
                    setStatus("fail");
                    toast.error("Thanh toán thất bại hoặc bị hủy!");
                } else if (res.status === 500) {
                    setStatus("error");
                    toast.error("Lỗi máy chủ khi xác minh thanh toán!");
                } else {
                    setStatus("fail");
                    toast.error("Không xác định kết quả thanh toán!");
                }
            } catch (err: any) {
                console.error("❌ [VERIFY ERROR]", err);
                const code = err.response?.status || 500;
                if (code === 400) {
                    setStatus("fail");
                    toast.error("Thanh toán thất bại hoặc bị hủy!");
                } else {
                    setStatus("error");
                    toast.error("Lỗi máy chủ khi xác minh thanh toán!");
                }
            }
        };

        verifyPayment();
    }, []);

    // ================= UI =================
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            {/* LOADING */}
            {status === "loading" && (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin text-[#38A3A5]" />
                    <p className="text-lg font-medium">Đang xác minh giao dịch...</p>
                </div>
            )}

            {/* SUCCESS */}
            {status === "success" && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <CheckCircle className="text-green-500 w-20 h-20 mb-2" />
                    <h2 className="text-2xl font-bold text-green-600">
                        Thanh toán thành công 🎉
                    </h2>
                    <p className="text-gray-600">Cảm ơn bạn đã sử dụng dịch vụ SwapNet!</p>

                    <div className="mt-3 text-sm">
                        <p>
                            Cổng thanh toán: <b>{gateway}</b>
                        </p>
                        {invoiceId && (
                            <p>
                                Mã hóa đơn:{" "}
                                <b className="text-[#38A3A5]">
                                    {invoiceId.slice(0, 8).toUpperCase()}
                                </b>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        {invoiceId && (
                            <Button
                                className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                                onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                            >
                                Xem hóa đơn
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => navigate("/home/invoices")}>
                            Về danh sách
                        </Button>
                    </div>
                </div>
            )}

            {/* FAIL */}
            {status === "fail" && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <XCircle className="text-orange-500 w-20 h-20 mb-2" />
                    <h2 className="text-2xl font-bold text-orange-600">
                        Thanh toán thất bại ⚠️
                    </h2>
                    <p className="text-gray-600">
                        Giao dịch không thành công hoặc đã bị hủy.
                    </p>

                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={() => navigate("/home/invoices")}>
                            Thử lại
                        </Button>
                        {invoiceId && (
                            <Button
                                className="bg-[#38A3A5] text-white"
                                onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                            >
                                Quay lại hóa đơn
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ERROR */}
            {status === "error" && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <AlertTriangle className="text-red-500 w-20 h-20 mb-2" />
                    <h2 className="text-2xl font-bold text-red-600">
                        Lỗi máy chủ ❌
                    </h2>
                    <p className="text-gray-600">
                        Có sự cố xảy ra trong quá trình xác minh thanh toán.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={() => navigate("/home/invoices")}>
                            Quay lại danh sách
                        </Button>
                        {invoiceId && (
                            <Button
                                className="bg-[#38A3A5] text-white"
                                onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                            >
                                Kiểm tra hóa đơn
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
