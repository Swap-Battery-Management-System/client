"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    type: string;
    durationDay: number;
    quota: number;
    price: string;
    status: boolean;
}

export default function Subscription() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get("/subscriptions", { withCredentials: true });
                // ✅ Dữ liệu trả về là mảng subscriptions
                setPlans(res.data.data.subscriptions || []);
            } catch (error) {
                console.error("Lỗi khi tải gói thuê bao:", error);
                toast.error("Không thể tải danh sách gói thuê bao");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return <p className="text-center mt-10">Đang tải dữ liệu...</p>;
    }

    if (plans.length === 0) {
        return <p className="text-center mt-10 text-gray-500">Không có gói thuê bao nào.</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-[#007577]">
                Danh sách gói thuê pin
            </h1>

            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className="p-6 shadow-md border border-gray-200 hover:shadow-lg transition"
                    >
                        <h3 className="text-xl font-semibold text-[#007577] mb-2">
                            {plan.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-2">{plan.description}</p>

                        <p className="text-2xl font-bold text-[#20406A] mb-1">
                            {Number(plan.price).toLocaleString("vi-VN")} ₫
                        </p>

                        <p className="text-sm text-gray-500 mb-3">
                            ⏳ {plan.durationDay} ngày | 🚗 {plan.quota} lượt | 🏷️ Loại: {plan.type}
                        </p>

                        <Button className="w-full bg-[#007577] hover:bg-[#005e5e] text-white">
                            Đăng ký ngay
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
