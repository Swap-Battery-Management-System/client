import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// 🎯 Danh sách vấn đề gợi ý
const danhSachVanDe = [
    { value: "Sự cố về pin", label: "🔋 Sự cố về pin" },
    { value: "Lỗi ứng dụng", label: "📱 Lỗi ứng dụng" },
    { value: "Không kết nối được xe", label: "🚗 Không kết nối được xe" },
    { value: "Lỗi thanh toán", label: "💸 Lỗi thanh toán" },
    { value: "Lỗi đặt lịch", label: "📅 Lỗi đặt lịch" },
    { value: "Không nhận được OTP", label: "📞 Không nhận được mã xác thực" },
    { value: "Không đăng nhập được", label: "🔐 Không đăng nhập được" },
    { value: "Không nhận được hóa đơn", label: "🧾 Không nhận được hóa đơn" },
    {
        value: "Giao dịch bị trừ tiền nhưng thất bại",
        label: "💰 Giao dịch bị trừ tiền nhưng thất bại",
    },
    { value: "Khác", label: "⚙️ Khác" },
];

export default function SupportTicketForm() {
    const { user } = useAuth();

    const [vanDeChon, setVanDeChon] = useState<string>("");
    const [form, setForm] = useState({
        danhMuc: "",
        tieuDe: "",
        moTa: "",
    });
    const [dangGui, setDangGui] = useState(false);

    // ====================== ✏️ Xử lý nhập liệu ======================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ====================== 🚀 Gửi form ======================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Kiểm tra rỗng
        if (!form.tieuDe.trim() || !form.moTa.trim()) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và mô tả chi tiết!");
            return;
        }

        // ✅ Nếu chọn "Khác" mà không nhập danh mục
        if (vanDeChon === "Khác" && !form.danhMuc.trim()) {
            toast.error("Vui lòng nhập danh mục cho vấn đề khác!");
            return;
        }

        try {
            setDangGui(true);
            const danhMuc = vanDeChon === "Khác" ? form.danhMuc.trim() : vanDeChon;

            // ✅ Gửi request đến API
            const res = await api.post("/support-tickets", {
                userId: user?.id,
                category: danhMuc,
                subject: form.tieuDe.trim(),
                description: form.moTa.trim(),
                status: "opened", // 🔥 Sửa lại đúng trạng thái hợp lệ
            });

            toast.success(res.data.message || "🎉 Gửi yêu cầu hỗ trợ thành công!");
            // ✅ Reset form sau khi gửi
            setForm({ danhMuc: "", tieuDe: "", moTa: "" });
            setVanDeChon("");
        } catch (err: any) {
            console.error("Gửi ticket lỗi:", err);
            toast.error(
                err.response?.data?.message || "❌ Không thể gửi yêu cầu hỗ trợ!"
            );
        } finally {
            setDangGui(false);
        }
    };

    // ====================== 🧩 Giao diện ======================
    return (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 mt-4">
            <h2 className="text-xl font-semibold text-[#38A3A5] mb-4">
                💬 Gửi yêu cầu hỗ trợ
            </h2>

            {/* ===== Bước 1: Chọn loại sự cố ===== */}
            {!vanDeChon ? (
                <div className="grid gap-3">
                    <p className="text-gray-700 mb-2 font-medium">
                        Vui lòng chọn loại sự cố bạn đang gặp phải:
                    </p>
                    {danhSachVanDe.map((item) => (
                        <Button
                            key={item.value}
                            variant="outline"
                            className="justify-start text-left hover:bg-[#e8f6f6]"
                            onClick={() => setVanDeChon(item.value)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nhập danh mục nếu chọn “Khác” */}
                        {vanDeChon === "Khác" ? (
                            <div>
                                <label className="block mb-1 font-medium">Danh mục</label>
                                <Input
                                    name="danhMuc"
                                    value={form.danhMuc}
                                    onChange={handleChange}
                                    placeholder="VD: Vấn đề khác (tài khoản, hồ sơ, ...)"
                                />
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium text-gray-700">
                                    Bạn đã chọn:{" "}
                                    <span className="text-[#38A3A5]">{vanDeChon}</span>
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block mb-1 font-medium">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="tieuDe"
                                value={form.tieuDe}
                                onChange={handleChange}
                                placeholder="Nhập tiêu đề ngắn gọn cho sự cố bạn gặp phải..."
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">
                                Mô tả chi tiết <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="moTa"
                                value={form.moTa}
                                onChange={handleChange}
                                placeholder="Vui lòng mô tả chi tiết sự cố hoặc góp ý của bạn..."
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="text-[#38A3A5] hover:bg-[#e8f6f6]"
                                onClick={() => setVanDeChon("")}
                            >
                                ← Quay lại danh sách vấn đề
                            </Button>

                            <Button
                                type="submit"
                                className="bg-[#38A3A5] hover:bg-[#2d898a] min-w-[180px]"
                                disabled={dangGui}
                            >
                                {dangGui ? "⏳ Đang gửi..." : "📩 Gửi yêu cầu hỗ trợ"}
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
