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
            try {
                const qs = location.search;

                let endpoint = "";

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
                    setStatus("error");
                    toast.error("Không xác định được gateway.");
                    return;
                }

                const params = new URLSearchParams(qs);
                const inv = params.get("invoiceId");
                if (inv) setInvoiceId(inv);

                const res = await api.get(endpoint);
                const code = res.data?.code;

                if (code === 200) {
                    setStatus("success");
                    toast.success("Thanh toán thành công!");
                } else if (code === 400) {
                    setStatus("fail");
                    toast.error(res.data?.message || "Thanh toán thất bại.");
                } else {
                    setStatus("error");
                    toast.error("Lỗi máy chủ khi xử lý thanh toán.");
                }
            } catch (err) {
                console.error(err);
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
