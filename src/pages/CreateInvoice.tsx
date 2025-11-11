import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
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

    // 🧮 Xử lý thay đổi & tính tổng tiền
    const handleChange = (field: keyof Invoice, value: string | number) => {
        const updated = { ...invoice, [field]: value };
        updated.amountTotal =
            Number(updated.amountOrigin || 0) - Number(updated.amountDiscount || 0);
        setInvoice(updated);
    };

    // 🧾 Gửi form (mock)
    const handleSubmit = () => {
        if (!invoice.userId || !invoice.bookingId || !invoice.amountOrigin) {
            toast.error("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");
            return;
        }

        toast.success("💾 Hóa đơn đã được tạo (mock)!");
        console.log("Invoice mock:", invoice);
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <Card className="border border-emerald-100 shadow-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-[#38A3A5] text-2xl font-bold">
                        🧾 TẠO HÓA ĐƠN TRẠM ĐỔI PIN
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* --- Nhóm thông tin chung --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Loại hóa đơn</Label>
                            <select
                                value={invoice.type}
                                onChange={(e) => handleChange("type", e.target.value)}
                                className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="booking">Booking</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>

                        <div>
                            <Label>Trạng thái</Label>
                            <select
                                value={invoice.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <Label>Mã người dùng (userId)</Label>
                            <Input
                                placeholder="user-001"
                                value={invoice.userId}
                                onChange={(e) => handleChange("userId", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Mã phụ (subUserId)</Label>
                            <Input
                                placeholder="sub-001"
                                value={invoice.subUserId}
                                onChange={(e) => handleChange("subUserId", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Mã Booking</Label>
                            <Input
                                placeholder="booking-001"
                                value={invoice.bookingId}
                                onChange={(e) => handleChange("bookingId", e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label>Lý do / Dịch vụ</Label>
                            <Textarea
                                rows={2}
                                placeholder="battery swap service"
                                value={invoice.reason}
                                onChange={(e) => handleChange("reason", e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* --- Phần tiền tệ --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <Label>Thành tiền gốc (VNĐ)</Label>
                            <Input
                                type="number"
                                value={invoice.amountOrigin}
                                onChange={(e) => handleChange("amountOrigin", Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label>Giảm giá (VNĐ)</Label>
                            <Input
                                type="number"
                                value={invoice.amountDiscount}
                                onChange={(e) => handleChange("amountDiscount", Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label className="font-semibold text-emerald-600">
                                Tổng thanh toán (VNĐ)
                            </Label>
                            <Input
                                type="number"
                                value={invoice.amountTotal}
                                readOnly
                                className="bg-emerald-50 font-semibold"
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-3">
                    <Button
                        onClick={handleSubmit}
                        className="bg-[#38A3A5] hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
                    >
                        💾 Tạo hóa đơn (Mock)
                    </Button>
                    <p className="text-sm text-gray-500 text-center">
                        *Trang này hiện là giao diện mô phỏng (mock). Sau khi backend hoàn thiện,
                        có thể tích hợp API POST <code>/invoices</code>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
