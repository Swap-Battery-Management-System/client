import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

interface PaymentMethod {
    id: string;
    name: string;
    code: string;     // momo / vnpay / payos / cash
    iconUrl: string;
}

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { amount, invoiceId } = location.state || { amount: 0, invoiceId: "" };

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selected, setSelected] = useState("");

    // Load danh sách phương thức
    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const res = await api.get("/payment-methods");
                const list = res.data?.data || [];
                setMethods(list);

                if (list.length > 0) setSelected(list[0].id);
            } catch (err) {
                toast.error("Không thể tải danh sách thanh toán");
            }
        };

        fetchMethods();
    }, []);

    const handleConfirm = async () => {
        if (!selected) {
            toast.error("Hãy chọn phương thức thanh toán");
            return;
        }

        try {
            const res = await api.post(`/invoices/${invoiceId}/pay`, {
                methodId: selected,
                totalAmount: amount
            });

            const paymentUrl = res.data?.data?.paymentUrl;

            // CASE 1: CASH
            if (!paymentUrl) {
                toast.success("Đã thanh toán tiền mặt!");
                navigate(`/home/invoice/${invoiceId}`);
                return;
            }

            // CASE 2: Redirect sang MoMo / VNPAY / PayOS
            window.location.href = paymentUrl;

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể tạo thanh toán");
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-[#38A3A5]">
                Thanh toán hóa đơn
            </h2>

            <p>Mã hóa đơn: <b>{invoiceId}</b></p>
            <p className="text-lg font-semibold mb-4">
                Số tiền: <span className="text-[#38A3A5]">
                    {amount.toLocaleString("vi-VN")}₫
                </span>
            </p>

            <h3 className="font-semibold mb-2">Phương thức thanh toán:</h3>

            <div className="grid grid-cols-2 gap-3">
                {methods.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => setSelected(m.id)}
                        className={`border-2 rounded-xl p-3 cursor-pointer flex flex-col items-center 
                            ${selected === m.id
                                ? "border-[#38A3A5] bg-[#e8f5f5]"
                                : "border-gray-200"
                            }`}
                    >
                        <img src={m.iconUrl} className="w-12 mb-2" />
                        <p>{m.name}</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-3 mt-5">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Button className="bg-[#38A3A5]" onClick={handleConfirm}>
                    Xác nhận
                </Button>
            </div>
        </div>
    );
}
