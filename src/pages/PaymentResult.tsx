import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

export default function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState<"loading" | "success" | "fail" | "error">("loading");
    const [gateway, setGateway] = useState("unknown");
    const [invoiceId, setInvoiceId] = useState("");

    useEffect(() => {
        const verify = async () => {

            console.log("=======================================");
            console.log("🔥 PAYMENT RESULT PAGE LOADED");
            console.log("📌 Full URL:", window.location.href);
            console.log("📌 Query String:", location.search);
            console.log("=======================================\n");

            try {
                const qs = location.search;
                let endpoint = "";

                console.log("🔍 Detecting gateway...");

                if (qs.includes("vnp_")) {
                    endpoint = `/payments/vnpay/verify${qs}`;
                    setGateway("VNPAY");
                } else if (qs.includes("orderCode")) {
                    endpoint = `/payments/payos/verify${qs}`;
                    setGateway("PayOS");
                } else if (qs.includes("momo") || qs.includes("resultCode")) {
                    endpoint = `/payments/momo/verify${qs}`;
                    setGateway("MoMo");
                } else {
                    console.log("❌ Gateway NOT detected!");
                    setStatus("error");
                    toast.error("Không xác định được gateway.");
                    return;
                }

                console.log("✅ Gateway:", gateway);
                console.log("➡️ BE verify endpoint:", endpoint);

                // Lấy invoiceId nếu có trên URL
                const params = new URLSearchParams(qs);
                const inv = params.get("invoiceId");
                console.log("📌 invoiceId on URL:", inv);

                if (inv) setInvoiceId(inv);

                console.log("🚀 Sending verify request to BE...");
                const res = await api.get(endpoint);

                console.log("\n====== VERIFY RESPONSE FROM BACKEND ======");
                console.log(res.data);
                console.log("==========================================\n");

                const code = res.data?.code;
                const beInvoice = res.data?.data?.invoiceId;
                console.log("📌 code:", code);
                console.log("📌 invoiceId from BE:", beInvoice);

                if (beInvoice && !inv) setInvoiceId(beInvoice);

                if (code === 200) {
                    console.log("🎉 Payment SUCCESS");
                    setStatus("success");
                    toast.success("Thanh toán thành công!");
                } else if (code === 400) {
                    console.log("⚠️ Payment FAIL - code 400");
                    setStatus("fail");
                    toast.error(res.data?.message || "Thanh toán thất bại.");
                } else {
                    console.log("❌ Payment ERROR (500 hoặc khác)");
                    setStatus("error");
                    toast.error("Lỗi máy chủ khi xử lý thanh toán.");
                }
            } catch (err: any) {
                console.log("❌ ERROR during verify:");
                console.error(err);

                console.log("\n====== AXIOS ERROR DETAILS ======");
                console.log("message:", err.message);
                console.log("response:", err.response?.data);
                console.log("status:", err.response?.status);
                console.log("request:", err.config?.url);
                console.log("=================================\n");

                setStatus("error");
                toast.error("Không thể xác minh giao dịch.");
            }
        };

        verify();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            {status === "loading" && (
                <div className="text-gray-600 flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#38A3A5]" />
                    <p>Đang xác minh giao dịch...</p>
                </div>
            )}

            {status === "success" && (
                <div className="text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h2>

                    <p className="mt-2">Cổng thanh toán: <b>{gateway}</b></p>
                    {invoiceId && (
                        <p className="text-gray-500 mt-1">
                            Mã hóa đơn: <b>{invoiceId}</b>
                        </p>
                    )}

                    <div className="mt-6 flex gap-4 justify-center">
                        <Button onClick={() => navigate("/home/invoice-history")} className="bg-[#38A3A5] text-white">
                            Lịch sử giao dịch
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/home")}>
                            Trang chủ
                        </Button>
                    </div>
                </div>
            )}

            {status === "fail" && (
                <div className="text-center">
                    <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-orange-600">Thanh toán thất bại!</h2>

                    <Button onClick={() => navigate("/home/invoice-history")} className="mt-6 bg-[#38A3A5] text-white">
                        Lịch sử giao dịch
                    </Button>
                </div>
            )}

            {status === "error" && (
                <div className="text-center">
                    <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600">Lỗi hệ thống</h2>

                    <Button onClick={() => navigate("/home/invoice-history")} className="mt-6 bg-[#38A3A5] text-white">
                        Lịch sử giao dịch
                    </Button>
                </div>
            )}
        </div>
    );
}
