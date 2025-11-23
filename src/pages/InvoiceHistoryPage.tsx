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
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-[#38A3A5] mb-6 text-center">
          🧾 LỊCH SỬ GIAO DỊCH
        </h2>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Mã hóa đơn</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {inv.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                      {inv.type.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.user.fullName}</p>
                    <p className="text-xs text-gray-500">{inv.user.email}</p>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(inv.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {inv.status === "processing" ? (
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                        PROCESSING
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        PAID
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold">
                    {Number(inv.amountTotal).toLocaleString("vi-VN")} ₫
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2 flex-wrap">
                      {inv.status === "processing" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-[#38A3A5] hover:text-white transition"
                          onClick={() => {if (inv.type === "subscription") {
                            navigate(
                              `/home/invoice/${inv.id}?type=subscription`
                            );
                          } else {
                            navigate(`/home/invoice/${inv.id}`);
                          }
}}
                        >
                          Thanh toán
                        </Button>
                      )}

                      {inv.status === "paid" && !hasFeedback(inv.id) && (
                        <Button
                          size="sm"
                          className="bg-[#38A3A5] text-white hover:opacity-90"
                          onClick={() => navigate(`/home/feedback/${inv.id}`)}
                        >
                          Đánh giá
                        </Button>
                      )}

                      {inv.status === "paid" && hasFeedback(inv.id) && (
                        <Button
                          disabled
                          size="sm"
                          className="bg-green-100 text-green-600 cursor-not-allowed"
                        >
                          ✔ Đã đánh giá
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
}
