import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function SupportTicketForm() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        category: "",
        subject: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!form.category || !form.subject || !form.description) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/support-tickets", {
                userId: user?.id,
                category: form.category,
                subject: form.subject,
                description: form.description,
                status: "open",
            });
            toast.success(res.data.message || "Gửi yêu cầu hỗ trợ thành công!");
            setForm({ category: "", subject: "", description: "" });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể gửi yêu cầu hỗ trợ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 mt-4">
            <h2 className="text-xl font-semibold text-[#38A3A5] mb-4">💬 Gửi yêu cầu hỗ trợ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Danh mục</label>
                    <Input
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="VD: Battery Issue / App Error / Booking Problem"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Tiêu đề</label>
                    <Input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="VD: Không thể kết nối ứng dụng"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mô tả chi tiết</label>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Vui lòng mô tả chi tiết sự cố bạn gặp phải..."
                        rows={4}
                    />
                </div>
                <Button
                    type="submit"
                    className="bg-[#38A3A5] hover:bg-[#2d898a]"
                    disabled={loading}
                >
                    {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
            </form>
        </div>
    );
}
