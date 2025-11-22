import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import InvoiceDetail from "@/pages/InvoiceDetail";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";

interface Step4PaymentProps {
  onPrev?: () => void;
  data: any;
}

export function Step4Payment({ data }: Step4PaymentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stationId = data?.station?.id;
  const invoiceId = data?.invoiceId;
  const swapSession = data?.swapSession;

  const { payments } = usePaymentSocket(stationId);

  const latestTransaction = useMemo(() => {
    if (!invoiceId || payments.length === 0) return null;
    const found = payments.find((p) => p.invoiceId === invoiceId);
    return found?.transaction || null;
  }, [payments, invoiceId]);

  const [transaction, setTransaction] = useState(latestTransaction);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!latestTransaction) return;
    setTransaction(latestTransaction);
    if (latestTransaction.status?.toLowerCase() === "completed") {
      setPaid(true);
      setTransaction(null); // ẩn transaction sau khi thanh toán
    }
  }, [latestTransaction]);

  const confirmCashPayment = async () => {
    if (!transaction) return;
    try {
      const transactionRes = await api.patch(
        `/transactions/${transaction.id}/confirm`,
        {}
      );
      console.log("confirm transaction", transactionRes.data);
      setPaid(true);
      setTransaction(null);
    } catch (err) {
      console.error("Xác nhận thanh toán lỗi:", err);
    }
  };

  const cardBg = "bg-[#F0FAFA]"; 
  const textColor = "text-[#1F6161]"; 

  return (
    <div className="space-y-6">
      {/* Loading */}
      {!transaction && !paid && swapSession?.status !== "completed" && (
        <Card
          className={`p-5 border-2 border-green-200 rounded-2xl shadow-md ${cardBg} animate-pulse max-w-lg mx-auto`}
        >
          <CardContent className={`font-semibold text-center ${textColor}`}>
            Đang chờ người dùng chọn phương thức thanh toán...
          </CardContent>
        </Card>
      )}

      {/* Transaction Card */}
      {transaction && !paid && (
        <Card
          className={`p-6 border-2 border-green-400 rounded-2xl shadow-xl ${cardBg} max-w-lg mx-auto hover:shadow-2xl transition-shadow duration-200`}
        >
          <CardContent className={`space-y-3 ${textColor}`}>
            <p>
              <strong>Phương thức:</strong>{" "}
              {transaction?.paymentMethod?.name || "Chưa có"}
            </p>
            <p>
              <strong>Trạng thái:</strong> {transaction?.status || "Chưa có"}
            </p>
            <p>
              <strong>Số tiền:</strong> {transaction?.totalAmount || 0} đ
            </p>

            {transaction?.paymentMethod?.name?.toLowerCase() === "cash" &&
              transaction?.status?.toLowerCase() === "processing" && (
                <Button
                  onClick={confirmCashPayment}
                  className="bg-[#1F6161] hover:bg-[#164949] text-white w-full mt-4 font-semibold"
                >
                  Xác nhận đã thu tiền
                </Button>
              )}
          </CardContent>
        </Card>
      )}

      {/* Paid Card */}
      {paid && (
        <Card
          className={`p-5 border-2 border-green-500 rounded-2xl shadow-lg ${cardBg} max-w-lg mx-auto`}
        >
          <CardContent className={`font-bold text-center ${textColor}`}>
            Thanh toán thành công!
          </CardContent>
        </Card>
      )}

      {/* Invoice Detail */}
      {invoiceId && (
        <InvoiceDetail
          invoiceId={invoiceId}
          staffMode={true}
          swapSessionId={swapSession?.id}
          onPaid={() => {
            setPaid(true);
            setTransaction(null);
          }}
        />
      )}
    </div>
  );
}
