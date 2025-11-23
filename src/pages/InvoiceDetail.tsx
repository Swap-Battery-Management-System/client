import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface InvoiceDetailProps {
  invoiceId?: string;
  staffMode?: boolean;
}

export default function InvoiceDetail({
  invoiceId: propInvoiceId,
  staffMode = false,
}: InvoiceDetailProps) {
  const { id: paramId } = useParams();
  const id = propInvoiceId || paramId;
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data.data.invoice);
      } catch (err) {
        console.error("❌ Lỗi tải hóa đơn:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">⏳ Đang tải...</p>;
  if (!invoice)
    return (
      <p className="text-center mt-10 text-gray-500">Không tìm thấy hóa đơn.</p>
    );

  const isSubscription = invoice.type === "subscription";

  const totalService =
    Number(invoice.amountOrigin || 0) - Number(invoice.amountDiscount || 0);
  const totalDamage =
    Number(invoice.amountFee || 0) - Number(invoice.amountFeeDiscount || 0);
    const [date, time] = invoice.createdAt.split("T");

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      {/* Nút quay lại */}
      {!staffMode && (
        <div className="mb-3">
          <Button
            variant="outline"
            className="px-4 py-2"
            onClick={() => navigate(-1)}
          >
            ⬅ Quay lại
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between border-b pb-3 mb-4">
        <div className="font-bold text-2xl text-[#38A3A5]">🔋 SWAPNET</div>
        <div className="text-right text-sm">
          <p className="font-semibold text-lg">
            {isSubscription
              ? "HÓA ĐƠN SUBSCRIPTION"
              : "HÓA ĐƠN DỊCH VỤ ĐỔI PIN"}
          </p>
          <p>MÃ HÓA ĐƠN: {invoice.id.slice(0, 8).toUpperCase()}</p>
          <p>
            NGÀY LẬP: <span className="font-medium">{date}</span> lúc{" "}
            <span className="font-medium">{time.split(".")[0]}</span>
          </p>
        </div>
      </div>

      {/* Khách hàng */}
      <section className="border-b pb-3 mb-3">
        <h3 className="font-semibold text-gray-700 mb-2">
          THÔNG TIN KHÁCH HÀNG
        </h3>
        <p>- Họ tên: {invoice.user?.fullName}</p>
        <p>- Email: {invoice.user?.email}</p>
        {invoice.user?.address && <p>- Địa chỉ: {invoice.user.address}</p>}
      </section>

      {/* Thông tin trạm (chỉ khi không phải subscription) */}
      {!isSubscription && (
        <section className="border-b pb-3 mb-3">
          <h3 className="font-semibold text-gray-700 mb-2">
            THÔNG TIN TRẠM HOẠT ĐỘNG
          </h3>
          <p>- Tên trạm: {invoice.swapSession?.station?.name || "—"}</p>
          <p>- Địa điểm: {invoice.swapSession?.station?.address || "—"}</p>
        </section>
      )}

      {/* Bảng chi tiết dịch vụ */}
      <section className="border-b pb-3 mb-3">
        <h3 className="font-semibold text-gray-700 mb-2">CHI TIẾT DỊCH VỤ</h3>
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Mô tả</th>
              <th className="border px-2 py-1 text-center">SL</th>
              <th className="border px-2 py-1 text-right">Đơn giá</th>
              {!isSubscription && (
                <th className="border px-2 py-1 text-right">Giảm giá</th>
              )}
              <th className="border px-2 py-1 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">
                {isSubscription
                  ? invoice.note || "Subscription"
                  : "Dịch vụ đổi pin"}
              </td>
              <td className="border text-center">1</td>
              <td className="border text-right">
                {Number(invoice.amountOrigin).toLocaleString("vi-VN")}
              </td>
              {!isSubscription && (
                <td className="border text-right text-red-500">
                  -{Number(invoice.amountDiscount).toLocaleString("vi-VN")}
                </td>
              )}
              <td className="border text-right font-medium">
                {totalService.toLocaleString("vi-VN")}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Phí hư hỏng (chỉ khi không phải subscription) */}
      {!isSubscription && (
        <section className="border-b pb-3 mb-3">
          <h3 className="font-semibold text-gray-700 mb-2">
            CHI TIẾT PHÍ HƯ HỎNG
          </h3>
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">STT</th>
                <th className="border px-2 py-1 text-left">Loại</th>
                <th className="border px-2 py-1 text-left">Tên mô tả</th>
                <th className="border px-2 py-1">Mức độ</th>
                <th className="border px-2 py-1 text-right">Phí</th>
                <th className="border px-2 py-1 text-right">Giảm giá</th>
                <th className="border px-2 py-1 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoiceDamageFees?.length > 0 ? (
                invoice.invoiceDamageFees.map((fee: any, index: number) => (
                  <tr key={fee.id}>
                    <td className="border text-center">{index + 1}</td>
                    <td className="border px-2">
                      {fee.damageFee.type === "internal_force"
                        ? "Bên trong"
                        : "Bên ngoài"}
                    </td>
                    <td className="border px-2">{fee.damageFee.name}</td>
                    <td className="border text-center">
                      {fee.damageFee.severity}
                    </td>
                    <td className="border text-right">
                      {Number(fee.amountOriginal).toLocaleString("vi-VN")}
                    </td>
                    <td className="border text-right text-red-500">
                      -{Number(fee.amountDiscount).toLocaleString("vi-VN")}
                    </td>
                    <td className="border text-right font-medium">
                      {Number(fee.amountFinal).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border py-2 text-center" colSpan={7}>
                    Không có phí hư hỏng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Tổng tiền */}
      <section className="text-sm space-y-1 text-right pr-2">
        <p>
          Tạm tính dịch vụ:{" "}
          <span className="font-medium ml-1">
            {totalService.toLocaleString("vi-VN")}
          </span>
        </p>
        {!isSubscription && (
          <p>
            Phí hư hỏng:{" "}
            <span className="font-medium ml-1">
              {totalDamage.toLocaleString("vi-VN")}
            </span>
          </p>
        )}
        <p className="pt-2 border-t font-semibold text-lg">
          THÀNH TIỀN:{" "}
          <span className="text-[#38A3A5] font-bold text-xl ml-1">
            {Number(invoice.amountTotal).toLocaleString("vi-VN")}₫
          </span>
        </p>
      </section>

      {/* Nút thanh toán */}
      {!staffMode && invoice.status === "processing" && (
        <div className="flex justify-end mt-6">
          <Button
            className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c] px-6 py-2 text-base"
            onClick={() =>
              navigate("/home/payment", {
                state: {
                  amount: Number(invoice.amountTotal),
                  invoiceId: invoice.id,
                },
              })
            }
          >
            THANH TOÁN
          </Button>
        </div>
      )}
    </div>
  );
}
