import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentResult() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const status = params.get("status");
    const invoiceId = params.get("invoiceId");
    const amount = params.get("amount");

    return (
        <div className="max-w-lg mx-auto p-6 text-center bg-white shadow-md mt-10 rounded-xl">
            {status === "success" ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-3">
                        🎉 Thanh toán thành công!
                    </h2>
                    <p>Mã hóa đơn: <b>{invoiceId}</b></p>
                    <p>Số tiền: <b>{Number(amount).toLocaleString("vi-VN")}₫</b></p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-3">
                        ❌ Thanh toán thất bại
                    </h2>
                    <p>Vui lòng thử lại hoặc kiểm tra hóa đơn</p>
                </>
            )}

            <button
                onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                className="mt-5 bg-[#38A3A5] text-white px-5 py-2 rounded-lg hover:bg-[#2e8a8c]"
            >
                Xem hóa đơn
            </button>
        </div>
    );
}
