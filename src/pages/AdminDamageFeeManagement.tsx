"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

interface DamageFee {
    id: string;
    name: string;
    severity: string;
    amount: number | string;
    unit: string;
    status: boolean;
    type: string;
    code: string;
    variant: string;
}

export default function AdminDamageFeeManagement() {
    const [fees, setFees] = useState<DamageFee[]>([]);
    const [filtered, setFiltered] = useState<DamageFee[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<DamageFee | null>(null);

    const [form, setForm] = useState({
        name: "",
        severity: "",
        amount: "",
        unit: "VND",
        status: true,
        type: "",
        code: "",
        variant: "",
    });

    // 🧭 Bộ lọc
    const [filters, setFilters] = useState({
        severity: "",
        type: "",
        variant: "",
        status: "",
    });

    // 🔹 Fetch danh sách phí
    const fetchFees = async () => {
        try {
            setLoading(true);
            const res = await api.get("/damage-fees");
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setFees(list);
            setFiltered(list);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách phí hư hại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    // 🔍 Lọc dữ liệu (tìm kiếm + filter)
    useEffect(() => {
        const timer = setTimeout(() => {
            const text = search.toLowerCase();
            let result = fees.filter((f) => {
                const matchesSearch =
                    !search ||
                    f.name.toLowerCase().includes(text) ||
                    f.code.toLowerCase().includes(text) ||
                    f.type.toLowerCase().includes(text);

                const matchesSeverity = !filters.severity || f.severity === filters.severity;
                const matchesType = !filters.type || f.type === filters.type;
                const matchesVariant = !filters.variant || f.variant === filters.variant;
                const matchesStatus =
                    !filters.status ||
                    (filters.status === "active" && f.status) ||
                    (filters.status === "inactive" && !f.status);

                return (
                    matchesSearch &&
                    matchesSeverity &&
                    matchesType &&
                    matchesVariant &&
                    matchesStatus
                );
            });

            setFiltered(result);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fees, filters]);

    // 🔹 Reset form
    const resetForm = () => {
        setEditItem(null);
        setForm({
            name: "",
            severity: "",
            amount: "",
            unit: "VND",
            status: true,
            type: "",
            code: "",
            variant: "",
        });
        setOpen(false);
    };

    // 🔹 Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.severity || !form.amount || !form.type || !form.variant) {
            toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        const payload = {
            ...form,
            amount: parseFloat(form.amount),
            status: !!form.status, // ✅ đảm bảo boolean
        };

        try {
            if (editItem) {
                if (!editItem.id) {
                    toast.error("Không tìm thấy ID phí cần cập nhật");
                    return;
                }
                const res = await api.patch(`/damage-fees/${editItem.id}`, payload);
                toast.success("Cập nhật thành công!");
                console.log("✅ PATCH thành công:", res.data);
            } else {
                const res = await api.post("/damage-fees", payload);
                toast.success("Thêm mới thành công!");
                console.log("✅ POST thành công:", res.data);
            }

            fetchFees();
            resetForm();
        } catch (err: any) {
            console.error("❌ Lỗi khi xử lý phí hư hại:", err.response?.data || err);
            toast.error("Lỗi khi xử lý phí hư hại");
        }
    };

    // 🔹 Xóa phí
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa phí này?")) return;
        try {
            await api.delete(`/damage-fees/${id}`);
            toast.success("Đã xóa thành công!");
            fetchFees();
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi xóa phí");
        }
    };

    // 🔹 Mở form sửa
    const handleEdit = (item: DamageFee) => {
        setEditItem(item);
        setForm({
            name: item.name,
            severity: item.severity,
            amount: item.amount.toString(),
            unit: item.unit,
            status: !!item.status, // ✅ boolean
            type: item.type,
            code: item.code,
            variant: item.variant,
        });
        setOpen(true);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-center mb-4 text-[#38A3A5]">
                Quản lý Phí Hư Hại (Damage Fees)
            </h2>

            <div className="flex items-center gap-3 mb-4">
                <Input
                    placeholder="Tìm kiếm theo tên, code, hoặc type..."
                    className="w-1/3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => resetForm()}
                                className="bg-[#38A3A5] hover:bg-[#2d8a8b] text-white"
                            >
                                + Thêm Phí
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{editItem ? "Cập nhật phí hư hại" : "Thêm phí hư hại mới"}</DialogTitle>
                                <DialogDescription>
                                    Vui lòng điền đầy đủ thông tin phí hư hại trước khi lưu.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
                                <div>
                                    <Label>Tên phí</Label>
                                    <Input
                                        placeholder="VD: Giảm dung lượng đột ngột"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Mức độ (Severity)</Label>
                                        <select
                                            className="w-full border rounded-md p-2"
                                            value={form.severity}
                                            onChange={(e) => setForm({ ...form, severity: e.target.value })}
                                        >
                                            <option value="">-- Chọn mức độ --</option>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Loại pin (Variant)</Label>
                                        <select
                                            className="w-full border rounded-md p-2"
                                            value={form.variant}
                                            onChange={(e) => setForm({ ...form, variant: e.target.value })}
                                        >
                                            <option value="">-- Chọn loại pin --</option>
                                            <option value="LFP">LFP</option>
                                            <option value="LIB">LIB</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Giá tiền (Amount)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Nhập số tiền"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <Label>Đơn vị (Unit)</Label>
                                        <Input
                                            value={form.unit}
                                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Loại (Type)</Label>
                                        <select
                                            className="w-full border rounded-md p-2"
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="">-- Chọn loại --</option>
                                            <option value="internal_force">Internal Force</option>
                                            <option value="external_force">External Force</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Code</Label>
                                        <Input
                                            placeholder="VD: VOLT_HIGH_LIB"
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Trạng thái</Label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={form.status ? "true" : "false"}
                                        onChange={(e) =>
                                            setForm({ ...form, status: e.target.value === "true" })
                                        }
                                    >
                                        <option value="true">Kích hoạt</option>
                                        <option value="false">Vô hiệu hóa</option>
                                    </select>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        className="bg-[#38A3A5] hover:bg-[#2d8a8b] text-white w-full"
                                    >
                                        {editItem ? "Lưu thay đổi" : "Xác nhận thêm"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Bộ lọc nằm giữa, đẹp và gọn */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                <select
                    className="border rounded-md p-2 w-[150px] focus:ring-1 focus:ring-[#38A3A5]"
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                >
                    <option value="">Mức độ</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>

                <select
                    className="border rounded-md p-2 w-[160px] focus:ring-1 focus:ring-[#38A3A5]"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">Loại</option>
                    <option value="internal_force">Internal Force</option>
                    <option value="external_force">External Force</option>
                </select>

                <select
                    className="border rounded-md p-2 w-[150px] focus:ring-1 focus:ring-[#38A3A5]"
                    value={filters.variant}
                    onChange={(e) => setFilters({ ...filters, variant: e.target.value })}
                >
                    <option value="">Pin</option>
                    <option value="LFP">LFP</option>
                    <option value="LIB">LIB</option>
                </select>

                <select
                    className="border rounded-md p-2 w-[150px] focus:ring-1 focus:ring-[#38A3A5]"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">Trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <Button
                    variant="outline"
                    className="border-[#38A3A5] text-[#38A3A5] hover:bg-[#38A3A5] hover:text-white"
                    onClick={() => setFilters({ severity: "", type: "", variant: "", status: "" })}
                >
                    Đặt lại
                </Button>
            </div>


            <div className="flex justify-end mb-2 font-semibold text-sm text-gray-600">
                Tổng: {filtered.length}
            </div>

            <Card className="p-4 shadow-md overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#eafaf9] text-[#38A3A5] font-semibold">
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Tên phí</th>
                            <th className="border p-2">Mức độ</th>
                            <th className="border p-2">Số tiền</th>
                            <th className="border p-2">Loại</th>
                            <th className="border p-2">Code</th>
                            <th className="border p-2">Pin</th>
                            <th className="border p-2">Trạng thái</th>
                            <th className="border p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="text-center p-4">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center p-4">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            filtered.map((f, i) => (
                                <tr key={f.id} className="hover:bg-[#f5fffe] border-b">
                                    <td className="border p-2 text-center">{i + 1}</td>
                                    <td className="border p-2 text-center">{f.name}</td>
                                    <td className="border p-2 text-center">{f.severity}</td>
                                    <td className="border p-2 text-center">
                                        {Number(f.amount).toLocaleString()} ₫
                                    </td>
                                    <td className="border p-2 text-center">{f.type}</td>
                                    <td className="border p-2 text-center font-mono">{f.code}</td>
                                    <td className="border p-2 text-center">{f.variant}</td>
                                    <td className="border p-2 text-center">
                                        {f.status ? "Active" : "Inactive"}
                                    </td>
                                    <td className="border p-2 text-center space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(f)}>
                                            Sửa
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(f.id)}>
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
