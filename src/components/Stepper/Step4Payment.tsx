import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import InvoiceDetail from "@/pages/InvoiceDetail";
import { useAuth } from "@/context/AuthContext";
import socket from "@/lib/socket";
import { Button } from "../ui/button";
import api from "@/lib/api";

interface Step4PaymentProps {
  onPrev: () => void;
  data: any; // data từ Step3, bao gồm invoiceId và swapSession
}

export function Step4Payment({ onPrev, data }: Step4PaymentProps) {
  const [paid, setPaid] = useState(false);
  const invoiceId = data?.invoiceId;
  const swapSessionId = data?.swapSession?.id;
  const { user } = useAuth();
  const station = data?.station;
  const [transaction, setTransaction] = useState<any>(null);

  // useEffect(() => {
  //   if (!user || !station || !invoiceId) return;
  //   // Đăng ký room
  //   socket.emit("register", user?.id);
  //   socket.emit("station-register", station?.id);

  //   // Lắng nghe sự kiện
  //   const handler = (payload: any) => {
  //     console.log("Payment status updated:", payload);
  //   };
  //   socket.on("payment:status", handler);

  //   return () => {
  //     // Hủy listener và leave room khi unmount
  //     socket.emit("unregister", user?.id);
  //     socket.emit("station-unregister", station?.id);
  //     socket.off("payment:status", handler);
  //   };
  // }, []);

  // const confirmCashPayment = async () => {
  //   if (!transaction) return;
  //   try {
  //     const transactionRes = await api.patch(
  //       `/transactions/${transaction.id}`,
  //       {
  //         status: "completed",
  //       }
  //     );
  //     setTransaction(transactionRes.data);
  //     const invoiceRes = await api.patch(`/invoices/${invoiceId}`, {
  //       status: "completed",
  //     });
  //     console.log("Invoice updated:", invoiceRes.data);
  //   } catch (err) {
  //     console.error("Xác nhận thanh toán lỗi:", err);
  //   }
  // };

  console.log("invoiceId", invoiceId);
  return (
    <div className="space-y-5">
      {/* Nút quay lại Step 3 */}
{/* 
      <Card className="p-3 border max-w-lg mx-auto">
        <p>
          <strong>Phương thức:</strong> {transaction.method}
        </p>
        <p>
          <strong>Trạng thái:</strong> {transaction.status}
        </p>
        <p>
          <strong>Số tiền:</strong> {transaction.amount}
        </p>
      </Card> */}
      {/* Embed InvoiceDetail với chế độ staff/payment */}
      {invoiceId && (
        <InvoiceDetail
          invoiceId={invoiceId}
          staffMode={true} // bật chế độ staff, show nút confirm
          swapSessionId={swapSessionId} // dùng để check socket hoặc trạng thái lắp pin
          onPaid={() => setPaid(true)} // callback khi thanh toán xong
        />
      )}

      {/* Nếu tiền mặt và chưa thanh toán
      {transaction.method === "cash" && transaction.status === "pending" && (
        <Button onClick={confirmCashPayment}>Xác nhận đã thu tiền</Button>
      )} */}

      {/* Thông báo sau khi thanh toán */}
      {paid && (
        <Card className="max-w-lg mx-auto border border-green-500 bg-green-50">
          <CardContent className="text-green-700 font-medium">
            💰 Thanh toán thành công!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
