import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Invoice {
  id: string;
  status: string;
  amountTotal: string;
  createdAt: string;
  user: { fullName: string; email: string };
  type: string;
}

interface Feedback {
  id: string;
  invoiceId: string;
}


export default function TransactionHistoryPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const navigate = useNavigate();

   useEffect(() => {
     const fetchData = async () => {
       try {
         const [invoiceRes, feedbackRes] = await Promise.all([
           api.get("/invoices?page=1&limit=50"),
           api.get("/feedbacks"),
         ]);

         const invoiceList = invoiceRes.data.data.invoices || [];
         const feedbackList = feedbackRes.data.data.feedbacks || [];
         console.log("feedback", feedbackList);

         const filtered = invoiceList.filter(
           (inv: Invoice) =>
             inv.status === "processing" || inv.status === "paid"
         );

         setInvoices(filtered);
         setFeedbacks(feedbackList);
       } catch (err) {
         console.error("Lỗi tải dữ liệu:", err);
       } finally {
         setLoading(false);
       }
     };

     fetchData();
   }, []);

   const hasFeedback = (invoiceId: string) => {
     return feedbacks.some((fb) => fb.invoiceId === invoiceId);
   };



    if (loading)
        return <p className="text-center mt-10">⏳ Đang tải...</p>;

    return (
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-[#38A3A5] mb-4 text-center">
                🧾 LỊCH SỬ GIAO DỊCH
            </h2>

            <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-3 py-2">Mã hóa đơn</th>
                        <th className="border px-3 py-2">Khách hàng</th>
                        <th className="border px-3 py-2">Ngày tạo</th>
                        <th className="border px-3 py-2">Trạng thái</th>
                        <th className="border px-3 py-2">Tổng tiền</th>
                        <th className="border px-3 py-2">Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="border px-3 py-2">
                                {inv.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="border px-3 py-2">
                                {inv.user.fullName}
                                <p className="text-xs text-gray-500">{inv.user.email}</p>
                            </td>
                            <td className="border px-3 py-2">
                                {new Date(inv.createdAt).toLocaleString("vi-VN")}
                            </td>
                            <td className="border px-3 py-2 text-center">
                                {inv.status === "processing" ? (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                        PROCESSING
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                        PAID
                                    </span>
                                )}
                            </td>
                            <td className="border px-3 py-2 text-right">
                                {Number(inv.amountTotal).toLocaleString("vi-VN")}
                            </td>
                            <td className="border px-3 py-2 text-center">
                                {inv.status === "processing" ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/home/invoice/${inv.id}`)}
                                    >
                                        💳 Thanh toán
                                    </Button>
                                ) : (
                                    <div>
                                        <Button
                                            disabled
                                            size="sm"
                                            className="border-green-500 text-green-600"
                                        >
                                            ✔ Đã thanh toán
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/home/invoice/${inv.id}`)}
                                        >
                                            👁 Xem chi tiết
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
