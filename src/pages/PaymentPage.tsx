import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

interface PaymentMethod {
    id: string;
    name: string;
    iconUrl: string;
    description?: string;
}

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { amount, invoiceId } = location.state || { amount: 0, invoiceId: "" };

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [methodId, setMethodId] = useState<string>("");

    // ==================== LOAD PAYMENT METHODS ====================
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const res = await api.get("/payment-methods");
                const list = res.data?.data || [];

                setPaymentMethods(list);

                if (list.length > 0) {
                    setMethodId(list[0].id); // chọn phương thức đầu tiên mặc định
                }

            } catch (err) {
                console.error("❌ Lỗi load payment methods:", err);
                toast.error("Không thể tải phương thức thanh toán!");
            }
        };

        fetchPaymentMethods();
    }, []);

    // ======================= HANDLE PAYMENT =======================
    const handleConfirm = async () => {
        console.log("👉 Bấm xác nhận thanh toán");
        console.log("Invoice:", invoiceId, "Amount:", amount, "MethodId:", methodId);

        try {
            const res = await api.post(`/invoices/${invoiceId}/pay`, {
                methodId: methodId,
                totalAmount: amount
            });

            console.log("✅ Backend trả về:", res.data);

            const paymentUrl = res.data?.data?.paymentUrl;

            // CASE 1: CASH => Không có paymentUrl
            if (!paymentUrl) {
                toast.success("Thanh toán tiền mặt thành công!");
                navigate(`/invoice/${invoiceId}`);
                return;
            }

            // CASE 2: VNPAY / MOMO => Redirect
            window.location.href = paymentUrl;

        } catch (err: any) {
            console.error("🔥 Lỗi tạo thanh toán:", err);

            if (err.response) {
                console.log("📌 STATUS:", err.response.status);
                console.log("📌 BACKEND:", err.response.data);
            }

            toast.error(err.response?.data?.message || "Không thể tạo thanh toán!");
        }
    };

    // ============================= UI ==============================

    return (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-[#38A3A5] mb-4 text-center">
                💳 Thanh toán hóa đơn
            </h2>

            <p className="text-sm text-gray-600 mb-2">
                Mã hóa đơn: <b>{invoiceId}</b>
            </p>

            <p className="text-lg font-semibold mb-6">
                Số tiền cần thanh toán:{" "}
                <span className="text-[#38A3A5]">
                    {amount.toLocaleString("vi-VN")}₫
                </span>
            </p>

            <h3 className="font-semibold mb-2">Chọn phương thức thanh toán:</h3>

            {/* Nếu chưa load xong */}
            {paymentMethods.length === 0 ? (
                <p className="text-center text-gray-500">Đang tải...</p>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setMethodId(item.id);
                                console.log("💡 Đã chọn phương thức:", item.id);
                            }}
                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-md ${methodId === item.id
                                    ? "border-[#38A3A5] bg-[#e7f7f6] scale-[1.03]"
                                    : "border-gray-200 hover:border-[#38A3A5]/50"
                                }`}
                        >
                            <img src={item.iconUrl} alt={item.name} className="w-14 h-14 mb-2" />
                            <p className="font-medium text-gray-700">{item.name}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    ⬅ Quay lại
                </Button>

                <Button
                    className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                    onClick={handleConfirm}
                >
                    ✅ Xác nhận thanh toán
                </Button>
            </div>
        </div>
    );
}
