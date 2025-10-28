import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

interface Model {
    id: string;
    name: string;
    brand: string;
    batteryTypeId: string;
}

interface BatteryType {
    id: string;
    name: string;
}

export default function ManageModels() {
    const [models, setModels] = useState<Model[]>([]);
    const [batteries, setBatteries] = useState<BatteryType[]>([]);
    const [filtered, setFiltered] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: "",
        brand: "",
        batteryTypeId: "",
    });

    const fetchBatteryTypes = async () => {
        try {
            const res = await api.get("/battery-types");
            const data = res.data?.data;
            if (data && Array.isArray(data.batteryTypes)) {
                setBatteries(data.batteryTypes);
            } else {
                console.warn("/battery-types không trả về mảng hợp lệ:", data);
                setBatteries([]);
            }
        } catch {
            toast.error("Không thể tải danh sách loại pin");
            setBatteries([]);
        }
    };

    const fetchModels = async () => {
        try {
            setLoading(true);
            const res = await api.get("/models");
            const list = Array.isArray(res.data?.data)
                ? res.data.data.map((m: Model) => ({
                    ...m,
                    id: m.id.slice(0, 8),
                }))
                : [];
            setModels(list);
            setFiltered(list);
        } catch {
            toast.error("Không thể tải danh sách model");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
        fetchBatteryTypes();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!search.trim()) {
                setFiltered(models);
            } else {
                const text = search.toLowerCase();
                setFiltered(
                    models.filter(
                        (m) =>
                            m.name.toLowerCase().includes(text) ||
                            m.brand.toLowerCase().includes(text)
                    )
                );
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, models]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.brand || !form.batteryTypeId) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            await api.post("/models", form);
            toast.success("Thêm model thành công!");
            fetchModels();
            setOpen(false);
            setForm({ name: "", brand: "", batteryTypeId: "" });
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi thêm model");
        }
    };

    const getBatteryName = (id: string) => {
        const found = batteries.find((b) => b.id === id);
        return found ? found.name : "—";
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-center mb-4 text-[#38A3A5]">
                Quản lý Model xe
            </h2>

            <div className="flex justify-between mb-4">
                <Input
                    placeholder="Nhập tên hoặc hãng xe..."
                    className="w-1/3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#38A3A5] hover:bg-[#2d8a8b] text-white">
                            + Thêm Model
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle>Thêm Model mới</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                            <div>
                                <Label>Tên Model</Label>
                                <Input
                                    placeholder="Ví dụ: VinFast Evo200"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Hãng sản xuất</Label>
                                <Input
                                    placeholder="Ví dụ: VinFast"
                                    value={form.brand}
                                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Loại Pin</Label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={form.batteryTypeId}
                                    onChange={(e) =>
                                        setForm({ ...form, batteryTypeId: e.target.value })
                                    }
                                >
                                    <option value="">-- Chọn loại pin --</option>
                                    {batteries.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="bg-[#38A3A5] hover:bg-[#2d8a8b] text-white w-full"
                                >
                                    Xác nhận thêm
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="p-4 shadow-md">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#eafaf9] text-[#38A3A5] font-semibold">
                            <th className="border p-2 text-center w-[60px]">STT</th>
                            <th className="border p-2 text-center">ID</th>
                            <th className="border p-2 text-center">Tên Model</th>
                            <th className="border p-2 text-center">Hãng</th>
                            <th className="border p-2 text-center">Loại Pin</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center p-4">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center p-4">
                                    Không có model nào
                                </td>
                            </tr>
                        ) : (
                            filtered.map((m, index) => (
                                <tr
                                    key={m.id}
                                    className="hover:bg-[#f5fffe] transition-all border-b"
                                >
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2 text-center font-mono">{m.id}</td>
                                    <td className="border p-2 text-center">{m.name}</td>
                                    <td className="border p-2 text-center">{m.brand}</td>
                                    <td className="border p-2 text-center">
                                        {getBatteryName(m.batteryTypeId)}
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
