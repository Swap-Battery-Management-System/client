import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function PaymentResult() {
    const navigate = useNavigate();
    const { method } = useParams();
    const query = new URLSearchParams(useLocation().search);

    const status = query.get("status") || query.get("code") || "unknown";
    const invoiceId = query.get("invoiceId") || query.get("id") || "";
    const amount = query.get("amount") || query.get("totalAmount") || "";

    const success = status === "PAID" || status === "00" || status === "success";

    return (
        <div className="max-w-lg mx-auto p-6 text-center mt-10 bg-white shadow-md rounded-xl">
            {success ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-2">
                        🎉 Thanh toán thành công bởi {method?.toUpperCase()}!
                    </h2>
                    <p>Mã hóa đơn: <b>{invoiceId}</b></p>
                    {amount && <p>Số tiền: <b>{Number(amount).toLocaleString()}₫</b></p>}
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-2">
                        ❌ Thanh toán thất bại
                    </h2>
                </>
            )}

            <button
                className="mt-5 bg-[#38A3A5] text-white px-5 py-2 rounded-lg"
                onClick={() => navigate(`/home/invoice/${invoiceId}`)}
            >
                Xem hóa đơn
            </button>
        </div>
    );
}
