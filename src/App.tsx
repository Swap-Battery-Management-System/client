import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Invoice {
  type: string;
  userId: string;
  subUserId: string;
  bookingId: string;
  amountOrigin: number;
  amountDiscount: number;
  amountTotal: number;
  reason: string;
  status: string;
}

export default function CreateInvoice() {
  const [invoice, setInvoice] = useState<Invoice>({
    type: "booking",
    userId: "",
    subUserId: "",
    bookingId: "",
    amountOrigin: 0,
    amountDiscount: 0,
    amountTotal: 0,
    reason: "battery swap service",
    status: "pending",
  });

  const handleChange = (field: keyof Invoice, value: string | number) => {
    const updated = { ...invoice, [field]: value };
    updated.amountTotal =
      Number(updated.amountOrigin || 0) - Number(updated.amountDiscount || 0);
    setInvoice(updated);
  };

  const handleSubmit = () => {
    alert("💾 Hóa đơn (mock):\n" + JSON.stringify(invoice, null, 2));
  };

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-4xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-emerald-600 text-xl font-bold">
            🧾 TẠO HÓA ĐƠN TRẠM ĐỔI PIN SWAPNET
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ========== THÔNG TIN CHUNG ========== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label htmlFor="type">Loại hóa đơn</Label>
                <select
                  id="type"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={invoice.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="booking">Booking</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <Label htmlFor="userId">Mã người dùng</Label>
                <Input
                  id="userId"
                  placeholder="user-001"
                  value={invoice.userId}
                  onChange={(e) => handleChange("userId", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="subUserId">Mã phụ (subUserId)</Label>
                <Input
                  id="subUserId"
                  placeholder="sub-001"
                  value={invoice.subUserId}
                  onChange={(e) => handleChange("subUserId", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="bookingId">Mã Booking</Label>
                <Input
                  id="bookingId"
                  placeholder="booking-001"
                  value={invoice.bookingId}
                  onChange={(e) => handleChange("bookingId", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={invoice.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="reason">Lý do / Dịch vụ</Label>
                <textarea
                  id="reason"
                  rows={2}
                  className="w-full border rounded-lg p-2 mt-1 resize-none"
                  placeholder="battery swap service"
                  value={invoice.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* ========== PHẦN TIỀN TỆ ========== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Thành tiền gốc (VNĐ)</Label>
              <Input
                type="number"
                value={invoice.amountOrigin}
                onChange={(e) =>
                  handleChange("amountOrigin", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label>Giảm giá (VNĐ)</Label>
              <Input
                type="number"
                value={invoice.amountDiscount}
                onChange={(e) =>
                  handleChange("amountDiscount", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label>Tổng thanh toán (VNĐ)</Label>
              <Input
                type="number"
                value={invoice.amountTotal}
                readOnly
                className="font-semibold bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              💾 Tạo hóa đơn (Mock)
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            *Trang này hiện chỉ là giao diện hiển thị, chưa gắn API. <br />
            Sau khi backend hoàn thiện, có thể tích hợp POST /invoices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
