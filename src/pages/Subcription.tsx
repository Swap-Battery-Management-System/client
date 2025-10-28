"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen text-[#007577] font-semibold text-lg">
                🔄 Đang tải dữ liệu gói thuê pin...
            </div>
        );

    if (plans.length === 0)
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
                Không có gói thuê bao nào.
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] py-16 px-6 flex flex-col items-center text-gray-800">
            <motion.h1
                className="text-4xl md:text-5xl font-extrabold mb-4 text-[#007577] drop-shadow-sm text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Gói Thuê Pin Xe Điện
            </motion.h1>

            <p className="text-gray-600 text-center max-w-2xl mb-10">
                Chọn gói thuê pin phù hợp với nhu cầu sử dụng của bạn. Tiết kiệm chi phí, tiện lợi và linh hoạt hơn bao giờ hết.
            </p>

            <motion.div
                className="grid gap-8 w-full max-w-6xl sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-stretch"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { staggerChildren: 0.1 },
                    },
                }}
            >
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <Card
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col h-full 
              border border-gray-200 shadow-md hover:shadow-2xl hover:scale-[1.03]
              transition-all duration-300 ease-out"
                        >
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-[#007577]">{plan.name}</h3>
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-full ${plan.type === "capacity"
                                            ? "bg-[#C7F9CC] text-[#1B4332]"
                                            : "bg-[#FFD6A5] text-[#7B3F00]"
                                            }`}
                                    >
                                        {plan.type === "capacity" ? "Dung lượng" : "Số lượt"}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>

                                <div className="mb-3">
                                    <p className="text-gray-400 line-through text-sm">
                                        {(Number(plan.price) * 1.1).toLocaleString("vi-VN")} ₫
                                    </p>
                                    <p className="text-3xl font-extrabold text-[#2D6A4F]">
                                        {Number(plan.price).toLocaleString("vi-VN")} ₫
                                    </p>
                                </div>

                                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                    <li>⏳ Thời hạn: {plan.durationDay} ngày</li>
                                    <li>
                                        🔋 {plan.type === "capacity" ? "Dung lượng" : "Số lượt"}:{" "}
                                        <span className="font-semibold text-[#007577]">
                                            {plan.type === "capacity"
                                                ? `${plan.quota / 1000} kWh`
                                                : `${plan.quota} lượt`}
                                        </span>
                                    </li>
                                    <li>⭐ Theo dõi pin và ưu tiên trạm đổi</li>
                                </ul>
                            </div>

                            <Button
                                variant="default"
                                disabled={!plan.status}
                                className={`w-full py-3 rounded-xl font-semibold text-white mt-auto 
                  bg-gradient-to-r from-[#57CC99] to-[#38A3A5] hover:opacity-90 hover:shadow-lg 
                  transition-all duration-300 ${!plan.status ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                            >
                                {plan.status ? "Đăng ký ngay" : "Tạm ngừng"}
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
