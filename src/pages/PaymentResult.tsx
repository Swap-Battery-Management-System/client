import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * 🌐 SwapNet PaymentResult Page
 * - Tự động nhận query từ redirect URL sau khi thanh toán
 * - Gọi API xác minh: /payments/{gateway}/verify
 * - Hiển thị kết quả thanh toán
 */
export default function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");
    const [gateway, setGateway] = useState<string>("unknown");
    const [invoiceId, setInvoiceId] = useState<string>("");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const query = location.search; // ?vnp_Amount=90000&vnp_ResponseCode=00&...
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
                    setStatus("fail");
                    return;
                }

                // 🔗 Thử lấy invoiceId từ query nếu có
                const params = new URLSearchParams(location.search);
                const inv = params.get("invoiceId");
                if (inv) setInvoiceId(inv);

                console.log(`🚀 [VERIFY] Calling ${endpoint}`);
                const res = await api.get(endpoint);

                console.log("✅ [VERIFY RESPONSE]", res.data);

                if (res.data?.success) {
                    setStatus("success");
                    toast.success("Thanh toán thành công!");
                } else {
                    setStatus("fail");
                    toast.error("Thanh toán thất bại hoặc bị hủy.");
                }
            } catch (err: any) {
                console.error("❌ [VERIFY ERROR]", err);
                setStatus("fail");
                toast.error("Lỗi xác minh thanh toán");
            }
        };

        verifyPayment();
    }, []);

    // ================= UI =================
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            {/* ====== LOADING ====== */}
            {status === "loading" && (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin text-[#38A3A5]" />
                    <p className="text-lg font-medium">Đang xác minh giao dịch...</p>
                </div>
            )}

            {/* ====== SUCCESS ====== */}
            {status === "success" && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <CheckCircle className="text-green-500 w-20 h-20 mb-2" />
                    <h2 className="text-2xl font-bold text-green-600">
                        Thanh toán thành công 🎉
                    </h2>
                    <p className="text-gray-600">
                        Cảm ơn bạn đã sử dụng dịch vụ SwapNet!
                    </p>

                    <div className="mt-3 space-y-1 text-sm">
                        <p>Cổng thanh toán: <b>{gateway}</b></p>
                        {invoiceId && (
                            <p>
                                Mã hóa đơn:&nbsp;
                                <b className="text-[#38A3A5]">{invoiceId.slice(0, 8).toUpperCase()}</b>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                            onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                        >
                            Xem hóa đơn
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/home/invoices")}>
                            Về danh sách
                        </Button>
                    </div>
                </div>
            )}

            {/* ====== FAIL ====== */}
            {status === "fail" && (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <XCircle className="text-red-500 w-20 h-20 mb-2" />
                    <h2 className="text-2xl font-bold text-red-600">
                        Thanh toán thất bại ❌
                    </h2>
                    <p className="text-gray-600">
                        Giao dịch của bạn không thành công hoặc đã bị hủy.
                    </p>

                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={() => navigate("/home/invoices")}>
                            Thử lại sau
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
        </div>
    );
}
