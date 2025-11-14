import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function PaymentResult() {
    const navigate = useNavigate();
    const { method } = useParams();
    const location = useLocation();

    // Parse query parameters
    const query = new URLSearchParams(location.search);

    const status =
        query.get("status") ||  // PayOS = PAID / CANCELLED
        query.get("code") ||    // VNPAY = 00 / 24 / 99
        "unknown";

    // Lấy invoiceId: từ URL query → hoặc từ state lúc redirect
    const invoiceId =
        query.get("invoiceId") ||
        query.get("id") || // PayOS trả id = invoiceId
        location.state?.invoiceId ||
        "";

    const amount =
        query.get("amount") ||
        query.get("totalAmount") ||
        location.state?.amount ||
        "";

    // Phân loại success theo chuẩn backend
    const success =
        status === "PAID" ||    // PayOS
        status === "00" ||      // VNPAY success
        status === "success";   // MoMo giả lập

    return (
        <div className="max-w-lg mx-auto p-6 text-center mt-10 bg-white shadow-md rounded-xl">
            {success ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-2">
                        🎉 Thanh toán thành công ({method?.toUpperCase()})
                    </h2>

                    <p className="text-gray-700 mt-2">
                        Mã hóa đơn: <b>{invoiceId}</b>
                    </p>

                    {amount && (
                        <p className="text-gray-700">
                            Số tiền:{" "}
                            <b>{Number(amount).toLocaleString("vi-VN")}₫</b>
                        </p>
                    )}

                    <button
                        className="mt-6 bg-[#38A3A5] hover:bg-[#2d8c8e] text-white px-5 py-2 rounded-lg"
                        onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                    >
                        📄 Xem chi tiết hóa đơn
                    </button>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-2">
                        ❌ Thanh toán thất bại
                    </h2>

                    <p className="text-gray-700 mt-2">
                        Có lỗi xảy ra trong quá trình thanh toán.
                    </p>

                    <div className="flex flex-col gap-3 mt-6 items-center">
                        <button
                            className="bg-[#38A3A5] hover:bg-[#2d8c8e] text-white px-5 py-2 rounded-lg"
                            onClick={() =>
                                navigate("/payment", {
                                    state: { invoiceId, amount },
                                })
                            }
                        >
                            🔄 Quay lại chọn phương thức thanh toán
                        </button>

                        {invoiceId && (
                            <button
                                className="text-sm text-gray-600 underline"
                                onClick={() =>
                                    navigate(`/home/invoice/${invoiceId}`)
                                }
                            >
                                📄 Xem hóa đơn
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
