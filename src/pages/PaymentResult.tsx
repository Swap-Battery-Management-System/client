import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

interface VerifyResponse {
    status: string;
    invoiceId: string;
    transactionId: string;
    message?: string;
}

export default function PaymentResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const { method } = useParams();

    const [loading, setLoading] = useState(true);
    const [verifyData, setVerifyData] = useState<VerifyResponse | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);

    // ================= VERIFY PAYMENT =================
    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy toàn bộ query params trả về từ cổng thanh toán
                const queryParams = Object.fromEntries(new URLSearchParams(location.search));

                console.log("📥 [VERIFY] Query nhận từ gateway:", queryParams);

                // Gửi lên BE để xác nhận thật
                const res = await api.post(`/payments/${method}/verify`, {
                    query: queryParams,
                });

                console.log("📦 [VERIFY] Backend trả về:", res.data);

                const data = res.data?.data || {};
                setVerifyData(data);

                if (data.status === "paid") {
                    setSuccess(true);
                    toast.success("Thanh toán thành công!");
                } else {
                    setSuccess(false);
                    toast.error("Thanh toán thất bại hoặc bị hủy!");
                }
            } catch (err: any) {
                console.error("❌ [VERIFY] Error:", err);
                setSuccess(false);
                toast.error(err.response?.data?.message || "Lỗi xác thực giao dịch");
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [location.search, method]);

    // ================= UI HIỂN THỊ =================
    if (loading) {
        return (
            <div className="max-w-lg mx-auto mt-16 bg-white shadow-md rounded-xl p-6 text-center">
                <h2 className="text-xl font-bold text-[#38A3A5] mb-4">🔄 Đang xác nhận giao dịch...</h2>
                <p>Vui lòng chờ trong giây lát...</p>
            </div>
        );
    }

    const invoiceId = verifyData?.invoiceId || "unknown";
    const transactionId = verifyData?.transactionId || "unknown";

    return (
        <div className="max-w-lg mx-auto mt-16 bg-white shadow-md rounded-xl p-6 text-center">
            {success ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-3">
                        🎉 Giao dịch thành công
                    </h2>

                    <p className="mb-2">
                        Mã hóa đơn hệ thống: <b>{invoiceId}</b>
                    </p>
                    <p className="mb-4">
                        Mã giao dịch cổng thanh toán: <b>{transactionId}</b>
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="bg-[#38A3A5] text-white w-full"
                            onClick={() => navigate("/home")}
                        >
                            🏠 Về trang chủ
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/home/invoices")}
                        >
                            📜 Xem lịch sử hóa đơn
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-3">
                        ❌ Giao dịch thất bại
                    </h2>

                    <p className="mb-2">
                        Mã hóa đơn hệ thống: <b>{invoiceId}</b>
                    </p>
                    <p className="mb-4">
                        Mã giao dịch cổng thanh toán: <b>{transactionId}</b>
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="bg-[#38A3A5] text-white w-full"
                            onClick={() =>
                                navigate("/payment", {
                                    state: { invoiceId },
                                })
                            }
                        >
                            🔁 Chọn lại phương thức thanh toán
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/home")}
                        >
                            ❌ Hủy & quay lại trang chủ
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
