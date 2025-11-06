"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import api from "@/lib/api";

type Plan = {
    id?: string;
    name: string;
    description?: string;
    price?: number | string;
    durationDay?: number;
    quota?: number;
    type?: string;
    status?: boolean;
};

export default function Subscription() {
    const [planType, setPlanType] = useState<"Dung lượng" | "Số lần">("Dung lượng");
    const [plans, setPlans] = useState<Record<"Dung lượng" | "Số lần", Plan[]>>({
        "Dung lượng": [],
        "Số lần": [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get("/subscriptions");
                if (response.data.status === "success") {
                    const allPlans = response.data.data.subscriptions;

                    const capacityPlans = allPlans.filter((p: any) => p.type === "capacity");
                    const usagePlans = allPlans.filter((p: any) => p.type === "usage");

                    setPlans({
                        "Dung lượng": capacityPlans,
                        "Số lần": usagePlans,
                    });
                }
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
                setPlans({
                    "Dung lượng": [],
                    "Số lần": [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center text-gray-500 text-lg">
                Đang tải dữ liệu gói dịch vụ...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] flex flex-col items-center py-16 text-gray-800">
            <h1 className="text-4xl font-extrabold mb-3 text-[#38A3A5] drop-shadow-sm">
                Gói dịch vụ trạm đổi pin
            </h1>

            <p className="text-gray-600 mb-8 text-center max-w-2xl">
                Lựa chọn gói phù hợp để tối ưu chi phí và tận hưởng trải nghiệm đổi pin nhanh chóng, tiện lợi.
            </p>

            {/* Toggle */}
            <div className="relative flex bg-[#C7F9CC] rounded-full p-2 mb-10 w-[320px] shadow-md">
                {["Dung lượng", "Số lần"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setPlanType(type as any)}
                        className={cn(
                            "relative z-10 flex-1 text-center py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                            planType === type
                                ? "text-white"
                                : "text-[#2D6A4F] hover:text-[#1B4332]"
                        )}
                    >
                        {type}
                        {planType === type && (
                            <motion.div
                                layoutId="activeToggle"
                                className="absolute inset-0 bg-gradient-to-r from-[#57CC99] to-[#38A3A5] rounded-full z-[-1]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-[90%] max-w-6xl">
                {plans[planType]?.length > 0 ? (
                    plans[planType].map((plan, i) => (
                        <Card
                            key={plan.id || i}
                            className={cn(
                                "bg-white/90 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl border-2",
                                i === 0
                                    ? "border-[#A3E4D7]"
                                    : i === 1
                                        ? "border-[#57CC99]"
                                        : "border-[#38A3A5]"
                            )}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-bold text-[#38A3A5] leading-tight">
                                        {plan.name}
                                    </h2>
                                    {plan.status && (
                                        <span className="text-xs bg-[#E9FCEF] text-[#2D6A4F] px-2 py-1 rounded-full font-semibold">
                                            Đang mở
                                        </span>
                                    )}
                                </div>

                                {plan.price && (
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-3xl font-bold text-[#2D6A4F]">
                                            {typeof plan.price === "number"
                                                ? plan.price.toLocaleString("vi-VN") + "đ"
                                                : plan.price}
                                        </span>
                                        <span className="text-gray-500 text-sm">/ gói</span>
                                    </div>
                                )}

                                <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-2 text-gray-600 text-sm mb-6">
                                {plan.quota && (
                                    <li>
                                        <span className="font-medium">Số lượt đổi:</span>{" "}
                                        <span className="text-[#38A3A5] font-semibold">
                                            {plan.quota} lần
                                        </span>
                                    </li>
                                )}
                                {plan.durationDay && (
                                    <li>
                                        <span className="font-medium">Thời hạn:</span>{" "}
                                        <span className="text-[#38A3A5] font-semibold">
                                            {plan.durationDay} ngày
                                        </span>
                                    </li>
                                )}
                            </ul>

                            <Button className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#57CC99] to-[#38A3A5] hover:opacity-90 hover:shadow-lg transition-all duration-300">
                                Đăng ký ngay
                            </Button>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">
                        Không có gói dịch vụ khả dụng.
                    </div>
                )}
            </div>
        </div>
    );
}
