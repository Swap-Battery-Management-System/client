import  { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// === Step 4: Payment ===
export function Step4Payment({ onPrev }: { onPrev: () => void }) {
  const mockInvoice = {
    id: "INV-20251025-001",
    amount: 120000,
    status: "Chưa thanh toán",
  };

  const [method, setMethod] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (method) setConfirmed(true);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold text-green-700">Thanh toán</h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Mã hóa đơn:</strong> {mockInvoice.id}
          </p>
          <p>
            <strong>Tổng tiền:</strong> {mockInvoice.amount.toLocaleString()}{" "}
            VND
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {confirmed ? "Đã thanh toán" : mockInvoice.status}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Phương thức thanh toán</Label>
          <div className="flex gap-2">
            <Button
              variant={method === "cash" ? "default" : "outline"}
              onClick={() => setMethod("cash")}
              className="flex-1"
            >
              Tiền mặt
            </Button>
            <Button
              variant={method === "wallet" ? "default" : "outline"}
              onClick={() => setMethod("wallet")}
              className="flex-1"
            >
              Ví điện tử
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={onPrev} className="flex-1">
            Quay lại
          </Button>
          <Button
            disabled={!method}
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            Xác nhận thanh toán
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
