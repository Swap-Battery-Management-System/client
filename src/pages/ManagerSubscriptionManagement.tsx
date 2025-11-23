"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

// 🟩 Kiểu dữ liệu Subscription
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

export default function ManagerSubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<"all" | "usage" | "capacity">("all");

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

    // 🟢 Lọc danh sách
    const filteredSubscriptions =
        filterType === "all"
            ? subscriptions
            : subscriptions.filter((sub) => sub.type === filterType);

    if (loading) {
        return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#2F8F9D]">Danh sách gói đăng ký</h1>
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
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
