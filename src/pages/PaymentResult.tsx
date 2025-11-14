import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function PaymentResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const { method } = useParams();

    console.log("📥 [RESULT] Raw query:", location.search);

    const query = new URLSearchParams(location.search);

    console.log("📌 Query params:");
    query.forEach((v, k) => console.log(`   ${k}: ${v}`));

    const status =
        query.get("status") ||
        query.get("code") ||
        query.get("message") ||
        "unknown";

    console.log("📌 status =", status);

    // FIX: Chỉ lấy invoiceId do mình gắn → không lấy 'id' của PayOS
    const invoiceId =
        query.get("invoiceId") ||
        location.state?.invoiceId ||
        "";

    console.log("🧾 invoiceId =", invoiceId);

    const transactionId =
        query.get("orderCode") ||
        query.get("transactionNo") ||
        query.get("vnp_TxnRef") ||
        query.get("tranId") ||
        "unknown";

    console.log("🔗 transactionId =", transactionId);

    const success =
        status === "PAID" ||
        status === "00" ||
        status === "success";

    console.log("🎯 SUCCESS =", success);

    return (
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-xl p-6 text-center mt-10">
            {success ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-4">
                        🎉 Giao dịch thành công
                    </h2>

                    <p className="mb-2">
                        Mã hóa đơn hệ thống: <b>{invoiceId}</b>
                    </p>

                    <p className="mb-4">
                        Mã giao dịch cổng thanh toán: <b>{transactionId}</b>
                    </p>

                    <button
                        className="w-full bg-[#38A3A5] text-white px-5 py-2 rounded-lg"
                        onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                    >
                        📄 Xem chi tiết hóa đơn
                    </button>

                    <button
                        className="w-full mt-3 bg-gray-200 text-gray-700 px-5 py-2 rounded-lg"
                        onClick={() => navigate("/home")}
                    >
                        🏠 Về trang chủ
                    </button>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-4">
                        ❌ Giao dịch thất bại
                    </h2>

                    <p className="mb-2">
                        Mã hóa đơn hệ thống: <b>{invoiceId}</b>
                    </p>

                    <p className="mb-4">
                        Mã giao dịch cổng thanh toán: <b>{transactionId}</b>
                    </p>

                    <button
                        className="w-full bg-[#38A3A5] text-white px-5 py-2 rounded-lg"
                        onClick={() =>
                            navigate("/home/payment", {
                                state: { invoiceId },
                            })
                        }
                    >
                        🔄 Chọn lại phương thức thanh toán
                    </button>

                    <button
                        className="w-full mt-3 bg-gray-200 text-gray-700 px-5 py-2 rounded-lg"
                        onClick={() => navigate("/home")}
                    >
                        ❌ Hủy & quay lại trang chủ
                    </button>
                </>
            )}
        </div>
    );
}
