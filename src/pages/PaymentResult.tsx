import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function PaymentResult() {
    const navigate = useNavigate();
    const { method } = useParams();
    const location = useLocation();

    const query = new URLSearchParams(location.search);

    // Lấy trạng thái thanh toán từ nhiều cổng
    const status =
        query.get("status") ||   // PayOS = PAID
        query.get("code") ||     // VNPAY = 00
        "unknown";

    // LẤY ID HÓA ĐƠN CHUẨN
    const invoiceId =
        query.get("orderCode") ||        // PayOS
        query.get("invoiceId") ||        // VNPAY / Momo
        location.state?.invoiceId ||     // fallback
        "";

    const amount =
        query.get("amount") ||
        query.get("totalAmount") ||
        location.state?.amount ||
        "";

    // Xác định thanh toán thành công
    const success =
        status === "PAID" ||   // PayOS
        status === "00" ||   // VNPAY
        status === "success";  // Momo giả lập

    return (
        <div className="max-w-lg mx-auto p-6 text-center mt-10 bg-white shadow-md rounded-xl">
            {success ? (
                <>
                    <h2 className="text-2xl text-green-600 font-bold mb-3">
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

                    {/* Nút xem hóa đơn */}
                    <button
                        className="mt-6 w-full bg-[#38A3A5] hover:bg-[#2d8c8e] text-white px-5 py-2 rounded-lg"
                        onClick={() => navigate(`/home/invoice/${invoiceId}`)}
                    >
                        📄 Xem hóa đơn
                    </button>

                    {/* Nút về trang chủ */}
                    <button
                        className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg"
                        onClick={() => navigate("/home")}
                    >
                        🏠 Về trang chủ
                    </button>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-red-600 font-bold mb-3">
                        ❌ Thanh toán thất bại
                    </h2>

                    <p className="text-gray-700 mt-2">
                        Có lỗi xảy ra trong quá trình thanh toán.
                    </p>

                    {/* Chọn phương thức thanh toán lại */}
                    <button
                        className="mt-6 w-full bg-[#38A3A5] hover:bg-[#2d8c8e] text-white px-5 py-2 rounded-lg"
                        onClick={() =>
                            navigate("/payment", {
                                state: { invoiceId, amount },
                            })
                        }
                    >
                        🔄 Chọn lại phương thức thanh toán
                    </button>

                    {/* Hủy giao dịch */}
                    <button
                        className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg"
                        onClick={() => navigate("/home")}
                    >
                        ❌ Hủy giao dịch & về trang chủ
                    </button>
                </>
            )}
        </div>
    );
}
