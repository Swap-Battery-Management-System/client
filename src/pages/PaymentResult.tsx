import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";

type PaymentStatus = "loading" | "success" | "fail" | "error" | "pending";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [gateway, setGateway] = useState<string>("unknown");
  const [invoiceId, setInvoiceId] = useState<string>("");
   const { payments } = usePaymentSocket("");

  useEffect(() => {
    const state = location.state as { method?: string; invoiceId?: string };

    // Nếu là thanh toán tiền mặt
    if (state?.method === "cash") {
      setGateway("Tiền mặt");
      setInvoiceId(state.invoiceId || "");
      setStatus("pending");
      toast.info("Thanh toán bằng tiền mặt! Vui lòng chờ nhân viên xác nhận.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const query = location.search;
        console.log("📩 [PAYMENT RESULT] Query:", query);

        let endpoint = "";
        if (query.includes("vnp_")) {
          endpoint = `/payments/vnpay/verify${query}`;
          setGateway("VNPay");
        } else if (
          query.includes("orderCode") ||
          query.includes("status=PAID")
        ) {
          endpoint = `/payments/payos/verify${query}`;
          setGateway("PayOS");
        } else if (query.includes("resultCode") || query.includes("momo")) {
          endpoint = `/payments/momo/verify${query}`;
          setGateway("MoMo");
        } else {
          toast.error("Không xác định được cổng thanh toán!");
          setStatus("error");
          return;
        }

        const res = await api.get(endpoint);
        console.log("✅ [VERIFY RESPONSE]", res.status, res.data);

        setInvoiceId(res.data?.invoiceId);

        const msg = (res.data?.message || res.data?.data || "")
          .toString()
          .toLowerCase();

        if (res.status === 200 && msg.includes("success")) {
          setStatus("success");
          toast.success("Thanh toán thành công!");
        } else if (res.status === 400) {
          setStatus("fail");
          toast.error("Thanh toán thất bại hoặc bị hủy!");
        } else if (res.status === 500) {
          setStatus("error");
          toast.error("Lỗi máy chủ khi xác minh thanh toán!");
        } else {
          setStatus("fail");
          toast.error("Không xác định kết quả thanh toán!");
        }
      } catch (err: any) {
        console.error("❌ [VERIFY ERROR]", err);
        const code = err.response?.status || 500;
        if (code === 400) {
          setStatus("fail");
          toast.error("Thanh toán thất bại hoặc bị hủy!");
        } else {
          setStatus("error");
          toast.error("Lỗi máy chủ khi xác minh thanh toán!");
        }
      }
    };

  }, []);

    useEffect(() => {
      if (payments.length > 0) {
        const latest = payments[0];
        if (
          latest.transaction?.status === "completed" &&
          latest.transaction?.paymentMethod?.name === "Cash"
        ) {
          console.log("socket tra ve payment", latest);
          setStatus("success");
          setInvoiceId(latest.invoiceId || "");
          toast.success("Nhân viên đã xác nhận thanh toán tiền mặt!");
        }
      }
    });

  // ================= UI =================
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#38A3A5]" />
            <p className="text-lg font-medium">Đang xác minh giao dịch...</p>
          </div>
        );
      case "pending":
        return (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <Loader2 className="w-20 h-20 animate-spin text-[#38A3A5] mb-2" />
            <h2 className="text-2xl font-bold text-[#38A3A5]">
              Thanh toán tiền mặt
            </h2>
            <p className="text-gray-600">
              Vui lòng chờ nhân viên xác nhận giao dịch.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                onClick={() => navigate("/home/transaction-history")}
              >
                Về lịch sử giao dịch
              </Button>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <CheckCircle className="text-green-500 w-20 h-20 mb-2" />
            <h2 className="text-2xl font-bold text-green-600">
              Thanh toán thành công 🎉
            </h2>
            <p className="text-gray-600">
              Cảm ơn bạn đã sử dụng dịch vụ SwapNet!
            </p>
            <div className="mt-3 text-sm">
              <p>
                Cổng thanh toán: <b>{gateway}</b>
              </p>
              {invoiceId && (
                <p>
                  Mã hóa đơn:{" "}
                  <b className="text-[#38A3A5]">
                    {invoiceId.slice(0, 8).toUpperCase()}
                  </b>
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                onClick={() => navigate("/home/transaction-history")}
              >
                Xem lịch sử giao dịch
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/home/feedback/${invoiceId}`)}
              >
                Đánh giá
              </Button>
            </div>
          </div>
        );
      case "fail":
        return (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <XCircle className="text-orange-500 w-20 h-20 mb-2" />
            <h2 className="text-2xl font-bold text-orange-600">
              Thanh toán thất bại ⚠️
            </h2>
            <p className="text-gray-600">
              Giao dịch không thành công hoặc đã bị hủy.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                onClick={() => navigate("/home/transaction-history")}
              >
                Về lịch sử giao dịch
              </Button>
            </div>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <AlertTriangle className="text-red-500 w-20 h-20 mb-2" />
            <h2 className="text-2xl font-bold text-red-600">Lỗi máy chủ ❌</h2>
            <p className="text-gray-600">
              Có sự cố xảy ra trong quá trình xác minh thanh toán.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c]"
                onClick={() => navigate("/home/transaction-history")}
              >
                Về lịch sử giao dịch
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {renderContent()}
    </div>
  );
}
