"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { FaSearch } from "react-icons/fa";

interface BatteryType {
    id: string;
    name: string;
    designCapacity: string;
    price: string;
}

export default function AdminBatteryTypeManagement() {
    const [batteryTypes, setBatteryTypes] = useState<BatteryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBatteryType, setEditingBatteryType] = useState<BatteryType | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [search, setSearch] = useState("");
    const [newBatteryType, setNewBatteryType] = useState({
        name: "",
        designCapacity: "",
        price: "",
    });

    const fetchBatteryTypes = async () => {
        try {
            setLoading(true);
            const res = await api.get<{ data: { batteryTypes: BatteryType[] } }>("/battery-types");
            setBatteryTypes(res.data.data.batteryTypes || []);
        } catch (error) {
            toast.error("Không thể lấy dữ liệu loại pin");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatteryTypes();
    }, []);

    // Tạo loại pin mới
    const handleCreateBatteryType = async () => {
        if (!newBatteryType.name || !newBatteryType.designCapacity || !newBatteryType.price) {
            toast.error("Vui lòng nhập đầy đủ thông tin loại pin");
            return;
        }

        try {
            const res = await api.post<{ data: BatteryType }>("/battery-types", newBatteryType, {
                withCredentials: true,
            });
            toast.success("Tạo loại pin thành công");
            setBatteryTypes((prev) => [...prev, res.data.data]);
            setShowCreateModal(false);
            setNewBatteryType({ name: "", designCapacity: "", price: "" });
        } catch (error) {
            toast.error("Tạo loại pin thất bại");
        }
    };

    // Cập nhật thông tin loại pin
    const handleUpdateBatteryType = async (updatedBatteryType: BatteryType) => {
        try {
            const { id, name, designCapacity, price } = updatedBatteryType;

            // Gửi request lên API
            await api.patch(
                `/battery-types/${id}`,
                { name, designCapacity, price },
                { withCredentials: true }
            );

            // Cập nhật state local để table tự động render
            setBatteryTypes((prev) =>
                prev.map((b) =>
                    b.id === id ? { ...b, name, designCapacity, price } : b
                )
            );

            toast.success("Cập nhật loại pin thành công");
        } catch (error) {
            toast.error("Cập nhật loại pin thất bại");
        }
    };

    const handleDeleteBatteryType = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa loại pin này không?")) return;
        try {
            const res = await api.delete(`/battery-types/${id}`, {
                withCredentials: true,
                validateStatus: () => true,
            });


            if (res.data?.status === "success") {
                setBatteryTypes((prev) => {
                    const updated = prev.filter((b) => b.id !== id);
                    return updated;
                });
                toast.success(res.data.data || "Xóa loại pin thành công");
            } else {
                toast.error(res.data?.data || "Xóa loại pin thất bại");
            }
        } catch (error: any) {
            toast.error("Xóa loại pin thất bại do lỗi server!");
        }
    };



    // Lọc pin theo search
    const filteredBatteryTypes = batteryTypes.filter(b =>
        b.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <div className="flex flex-col p-8 bg-[#F8FBFB] min-h-screen">
            <h1 className="text-3xl font-semibold text-center text-[#2F8F9D] mb-6">
                Quản lý loại pin (Admin)
            </h1>

            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                {/* Ô tìm kiếm với icon */}
                <div className="relative flex-1 min-w-[220px] max-w-sm w-full">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo loại pin..."
                        className="border rounded pl-9 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#38A3A5]"
                    />
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Nút Thêm loại pin */}
                <Button
                    className="bg-green-500 hover:bg-green-600 text-white w-full md:w-auto"
                    onClick={() => setShowCreateModal(true)}
                >
                    Thêm loại pin
                </Button>

                <span className="ml-auto font-semibold text-sm">
                    Số lượng: {filteredBatteryTypes.length}
                </span>
            </div>

            {loading && <p className="text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</p>}

            {!loading && batteryTypes.length === 0 && (
                <p className="text-center text-gray-500">Không có loại pin nào.</p>
            )}

            {!loading && batteryTypes.length > 0 && (
                <table className="min-w-full border border-[#CDE8E5] bg-white shadow-md">
                    <thead className="bg-[#E6F7F7] text-[#2F8F9D]">
                        <tr>
                            <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">STT</th>
                            <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Tên loại pin</th>
                            <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Dung lượng thiết kế</th>
                            <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Giá</th>
                            <th className="border border-[#CDE8E5] px-3 py-2 text-sm font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBatteryTypes.map((b, index) => (
                            <tr key={b.id} className="hover:bg-gray-50 transition">
                                <td className="border px-3 py-2 text-center">{index + 1}</td>
                                <td className="border px-3 py-2">{b.name}</td>
                                <td className="border px-3 py-2 text-center">{b.designCapacity} mAh</td>
                                <td className="border px-3 py-2 text-center">{Number(b.price).toLocaleString()} VNĐ</td>
                                <td className="border px-3 py-2 text-center">
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                        onClick={() => {
                                            setEditingBatteryType(b);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => handleDeleteBatteryType(b.id)}
                                    >
                                        Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Modal tạo loại pin */}
            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white p-6 rounded-xl w-[400px]">
                        <h2 className="text-xl font-semibold text-[#2F8F9D] mb-4">Thêm loại pin mới</h2>
                        <div className="space-y-3">
                            <div>
                                <Label>Tên loại pin</Label>
                                <input
                                    type="text"
                                    value={newBatteryType.name}
                                    onChange={(e) => setNewBatteryType({ ...newBatteryType, name: e.target.value })}
                                    className="border rounded w-full px-2 py-1 text-sm"
                                />
                            </div>
                            <div>
                                <Label>Dung lượng thiết kế (mAh)</Label>
                                <input
                                    type="number"
                                    value={newBatteryType.designCapacity}
                                    onChange={(e) => setNewBatteryType({ ...newBatteryType, designCapacity: e.target.value })}
                                    className="border rounded w-full px-2 py-1 text-sm"
                                />
                            </div>
                            <div>
                                <Label>Giá (VNĐ)</Label>
                                <input
                                    type="number"
                                    value={newBatteryType.price}
                                    onChange={(e) => setNewBatteryType({ ...newBatteryType, price: e.target.value })}
                                    className="border rounded w-full px-2 py-1 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleCreateBatteryType}>
                                Tạo
                            </Button>
                            <Button className="bg-gray-400 hover:bg-gray-500 text-white" onClick={() => setShowCreateModal(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa loại pin */}
            {showEditModal && editingBatteryType && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white p-6 rounded-xl w-[400px]">
                        <h2 className="text-xl font-semibold text-[#2F8F9D] mb-4">Chỉnh sửa loại pin</h2>
                        <div className="space-y-3">
                            <div>
                                <Label>Tên loại pin</Label>
                                <input
                                    type="text"
                                    value={editingBatteryType.name}
                                    onChange={(e) =>
                                        setEditingBatteryType({ ...editingBatteryType, name: e.target.value })
                                    }
                                    className="border rounded w-full px-2 py-1 text-sm"
                                />
                            </div>
                            <div>
                                <Label>Dung lượng thiết kế (mAh)</Label>
                                <input
                                    type="number"
                                    value={editingBatteryType.designCapacity}
                                    onChange={(e) =>
                                        setEditingBatteryType({ ...editingBatteryType, designCapacity: e.target.value })
                                    }
                                    className="border rounded w-full px-2 py-1 text-sm"
                                />
                            </div>
                            <div>
                                <Label>Giá (VNĐ)</Label>
                                <input
                                    type="number"
                                    value={editingBatteryType.price}
                                    onChange={(e) =>
                                        setEditingBatteryType({ ...editingBatteryType, price: e.target.value })
                                    }
                                    className="border rounded w-full px-2 py-1 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => {
                                    if (editingBatteryType) handleUpdateBatteryType(editingBatteryType);
                                    setShowEditModal(false);
                                }}
                            >
                                Lưu
                            </Button>
                            <Button
                                className="bg-gray-400 hover:bg-gray-500 text-white"
                                onClick={() => setShowEditModal(false)}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
