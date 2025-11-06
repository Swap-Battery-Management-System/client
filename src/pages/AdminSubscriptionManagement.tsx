"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

// 🟩 Kiểu dữ liệu cho Subscription
type Subscription = {
    id?: string;
    name: string;
    description: string;
    price: number;
    durationDay: number;
    type: string;
    quota: number;
    status: boolean;
};

export default function AdminSubscription() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [filterType, setFilterType] = useState<"all" | "usage" | "capacity">("all");

    const [newSubscription, setNewSubscription] = useState({
        name: "",
        description: "",
        price: 0,
        durationDay: 0,
        quota: 0,
        type: "",
        status: true,
    });

    // 🟢 Lấy danh sách gói đăng ký
    const fetchSubscriptions = async () => {
        try {
            const res = await api.get("/subscriptions", { withCredentials: true });
            if (res.data?.data?.subscriptions) {
                setSubscriptions(res.data.data.subscriptions);
            } else {
                toast.error("Không tìm thấy dữ liệu gói đăng ký");
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
            toast.error("Không thể tải danh sách gói đăng ký");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // 🟢 Lọc danh sách theo loại
    const filteredSubscriptions =
        filterType === "all"
            ? subscriptions
            : subscriptions.filter((sub) => sub.type === filterType);

    // 🟢 Tạo mới
    const handleCreateSubscription = async () => {
        const { name, description, price, durationDay, type, quota } = newSubscription;
        if (!name || !description || !price || !durationDay || !type || !quota) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            await api.post(
                "/subscriptions",
                {
                    name,
                    description,
                    price: Number(price),
                    durationDay: Number(durationDay),
                    quota: Number(quota),
                    type,
                    status: true,
                },
                { withCredentials: true }
            );
            toast.success("Tạo gói đăng ký thành công");
            await fetchSubscriptions();
            setShowCreateModal(false);
            setNewSubscription({
                name: "",
                description: "",
                price: 0,
                durationDay: 0,
                quota: 0,
                type: "",
                status: true,
            });
        } catch (error: any) {
            console.error("Lỗi tạo gói:", error.response?.data || error.message);
            toast.error(`Lỗi tạo gói: ${error.response?.data?.message || "Bad Request"}`);
        }
    };

    // 🟢 Cập nhật gói
    const handleUpdateSubscription = async () => {
        if (!editingSubscription?.id) return;

        try {
            await api.patch(
                `/subscriptions/${editingSubscription.id}`,
                {
                    ...editingSubscription,
                    price: Number(editingSubscription.price),
                    durationDay: Number(editingSubscription.durationDay),
                    quota: Number(editingSubscription.quota),
                },
                { withCredentials: true }
            );
            toast.success("Cập nhật gói thành công");
            await fetchSubscriptions();
            setShowEditModal(false);
            setEditingSubscription(null);
        } catch (error: any) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message);
            toast.error("Không thể cập nhật gói đăng ký");
        }
    };

    // 🟢 Xóa gói
    const handleDeleteSubscription = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa gói này?")) return;
        try {
            await api.delete(`/subscriptions/${id}`, { withCredentials: true });
            toast.success("Xóa gói đăng ký thành công");
            await fetchSubscriptions();
        } catch (error) {
            console.error("Lỗi xóa gói:", error);
            toast.error("Không thể xóa gói đăng ký");
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#2F8F9D]">Quản lý gói đăng ký</h1>
                <Button onClick={() => setShowCreateModal(true)}>
                    <FaPlus className="mr-2" /> Thêm gói mới
                </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {[
                    { label: "Tất cả", value: "all" },
                    { label: "Theo lượt hoán", value: "usage" },
                    { label: "Theo dung lượng", value: "capacity" },
                ].map((opt) => (
                    <Button
                        key={opt.value}
                        variant={filterType === opt.value ? "default" : "outline"}
                        onClick={() => setFilterType(opt.value as any)}
                        className={`${filterType === opt.value
                                ? "bg-[#2F8F9D] text-white"
                                : "text-[#2F8F9D] border-[#2F8F9D]"
                            } transition-all`}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>

            {/* Danh sách */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSubscriptions.length === 0 ? (
                    <p className="text-gray-500 italic">Không có gói đăng ký nào.</p>
                ) : (
                    filteredSubscriptions.map((sub) => (
                        <Card key={sub.id} className="p-4 rounded-2xl shadow-md">
                            <h2 className="font-semibold text-lg text-[#2F8F9D]">{sub.name}</h2>
                            <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                            <p className="mt-2 text-sm">
                                <span className="font-medium">Loại:</span> {sub.type}
                            </p>
                            <p className="mt-1 text-sm">
                                <span className="font-medium">Thời hạn:</span> {sub.durationDay} ngày
                            </p>
                            <p className="mt-1 text-sm">
                                <span className="font-medium">Quota:</span> {sub.quota}
                            </p>
                            <p className="mt-1 text-sm">
                                <span className="font-medium">Giá:</span>{" "}
                                {Number(sub.price).toLocaleString()}đ
                            </p>
                            <p className="mt-1 text-sm">
                                <span className="font-medium">Trạng thái:</span>{" "}
                                <span className={sub.status ? "text-green-600" : "text-red-600"}>
                                    {sub.status ? "Hoạt động" : "Ngưng"}
                                </span>
                            </p>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingSubscription(sub);
                                        setShowEditModal(true);
                                    }}
                                >
                                    <FaEdit className="mr-1" /> Sửa
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteSubscription(sub.id!)}
                                >
                                    <FaTrash className="mr-1" /> Xóa
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* 🟢 Modal tạo */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-md bg-white rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Tạo gói đăng ký mới</DialogTitle>
                        <DialogDescription>Nhập thông tin chi tiết gói đăng ký</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Tên gói</Label>
                            <input
                                type="text"
                                className="border rounded w-full px-2 py-1 text-sm"
                                value={newSubscription.name}
                                onChange={(e) =>
                                    setNewSubscription({ ...newSubscription, name: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>Mô tả</Label>
                            <textarea
                                className="border rounded w-full px-2 py-1 text-sm"
                                value={newSubscription.description}
                                onChange={(e) =>
                                    setNewSubscription({
                                        ...newSubscription,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label>Giá</Label>
                            <input
                                type="number"
                                className="border rounded w-full px-2 py-1 text-sm"
                                value={newSubscription.price}
                                onChange={(e) =>
                                    setNewSubscription({
                                        ...newSubscription,
                                        price: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label>Thời hạn (ngày)</Label>
                            <input
                                type="number"
                                className="border rounded w-full px-2 py-1 text-sm"
                                value={newSubscription.durationDay}
                                onChange={(e) =>
                                    setNewSubscription({
                                        ...newSubscription,
                                        durationDay: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label>Quota</Label>
                            <input
                                type="number"
                                className="border rounded w-full px-2 py-1 text-sm"
                                value={newSubscription.quota}
                                onChange={(e) =>
                                    setNewSubscription({
                                        ...newSubscription,
                                        quota: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label>Loại gói</Label>
                            <select
                                className="border rounded w-full px-2 py-1 text-sm"
                                value={newSubscription.type}
                                onChange={(e) =>
                                    setNewSubscription({
                                        ...newSubscription,
                                        type: e.target.value,
                                    })
                                }
                            >
                                <option value="">-- Chọn loại gói --</option>
                                <option value="usage">Theo lượt hoán</option>
                                <option value="capacity">Theo dung lượng</option>
                            </select>
                        </div>
                        <Button onClick={handleCreateSubscription} className="w-full">
                            Tạo gói
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 🟢 Modal chỉnh sửa */}
            {editingSubscription && (
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="max-w-md bg-white rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa gói đăng ký</DialogTitle>
                            <DialogDescription>Cập nhật thông tin gói đăng ký</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div>
                                <Label>Tên gói</Label>
                                <input
                                    type="text"
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.name}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Mô tả</Label>
                                <textarea
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.description}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Giá</Label>
                                <input
                                    type="number"
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.price}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            price: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Thời hạn (ngày)</Label>
                                <input
                                    type="number"
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.durationDay}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            durationDay: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Quota</Label>
                                <input
                                    type="number"
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.quota}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            quota: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Loại gói</Label>
                                <select
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.type}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            type: e.target.value,
                                        })
                                    }
                                >
                                    <option value="usage">Theo lượt hoán</option>
                                    <option value="capacity">Theo dung lượng</option>
                                </select>
                            </div>
                            <div>
                                <Label>Trạng thái</Label>
                                <select
                                    className="border rounded w-full px-2 py-1 text-sm"
                                    value={editingSubscription.status ? "true" : "false"}
                                    onChange={(e) =>
                                        setEditingSubscription({
                                            ...editingSubscription,
                                            status: e.target.value === "true",
                                        })
                                    }
                                >
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Ngưng</option>
                                </select>
                            </div>
                            <Button onClick={handleUpdateSubscription} className="w-full">
                                Cập nhật
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
