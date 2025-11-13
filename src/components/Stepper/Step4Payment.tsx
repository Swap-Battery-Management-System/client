import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import InvoiceDetail from "@/pages/InvoiceDetail";

interface Step4PaymentProps {
  onPrev: () => void;
  data: any; // data từ Step3, bao gồm invoiceId và swapSession
}

export function Step4Payment({ onPrev, data }: Step4PaymentProps) {
  const [paid, setPaid] = useState(false);

  const invoiceId = data?.invoiceId;
  const swapSessionId = data?.swapSession?.id; // fix từ swapSession

  console.log("invoiceId",invoiceId);
  return (
    <div className="space-y-5">
      {/* Nút quay lại Step 3 */}

      {/* Embed InvoiceDetail với chế độ staff/payment */}
      {invoiceId && (
        <InvoiceDetail
          invoiceId={invoiceId}
          staffMode={true} // bật chế độ staff, show nút confirm
          swapSessionId={swapSessionId} // dùng để check socket hoặc trạng thái lắp pin
          onPaid={() => setPaid(true)} // callback khi thanh toán xong
        />
      )}

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
