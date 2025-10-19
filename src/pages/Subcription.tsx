import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Subscription() {
    const [planType, setPlanType] = useState<"Dung lượng" | "Số lần">("Dung lượng");

    type Plan = {
        name: string;
        discount: string;
        oldPrice: string;
        price: string;
        capacity?: string;
        swaps?: string;
        features: string[];
        buttonText: string;
    };

    const plans: Record<"Dung lượng" | "Số lần", Plan[]> = {
        "Dung lượng": [
            {
                name: "Theo ngày",
                discount: "10% OFF",
                oldPrice: "50.000đ",
                price: "45.000đ",
                capacity: "10 kWh",
                features: [
                    "Theo dõi tình trạng pin thời gian thực",
                    "Ưu tiên sạc tại trạm gần nhất",
                ],
                buttonText: "Đăng ký ngay",
            },
            {
                name: "Theo tháng",
                discount: "15% OFF",
                oldPrice: "500.000đ",
                price: "425.000đ",
                capacity: "100 kWh",
                features: [
                    "Theo dõi pin & lịch sử sạc",
                    "Ưu tiên sạc nhanh tại trạm",
                    "Cảnh báo dung lượng pin thấp",
                ],
                buttonText: "Đăng ký ngay",
            },
            {
                name: "Theo năm",
                discount: "25% OFF",
                oldPrice: "6.000.000đ",
                price: "4.500.000đ",
                capacity: "1200 kWh",
                features: [
                    "Theo dõi chi tiết hiệu suất pin",
                    "Ưu tiên sạc tại mọi trạm toàn quốc",
                    "Hỗ trợ kỹ thuật 24/7",
                ],
                buttonText: "Đăng ký ngay",
            },
        ],
        "Số lần": [
            {
                name: "Theo ngày",
                discount: "5% OFF",
                oldPrice: "40.000đ",
                price: "38.000đ",
                swaps: "1 lượt đổi pin",
                features: [
                    "Đổi pin tại bất kỳ trạm nào",
                    "Không giới hạn dung lượng pin",
                ],
                buttonText: "Đăng ký ngay",
            },
            {
                name: "Theo tháng",
                discount: "10% OFF",
                oldPrice: "400.000đ",
                price: "360.000đ",
                swaps: "10 lượt đổi pin",
                features: [
                    "Ưu tiên đổi pin tại giờ cao điểm",
                    "Theo dõi số lượt đổi còn lại",
                    "Cảnh báo bảo trì pin",
                ],
                buttonText: "Đăng ký ngay",
            },
            {
                name: "Theo năm",
                discount: "20% OFF",
                oldPrice: "4.800.000đ",
                price: "3.840.000đ",
                swaps: "120 lượt đổi pin",
                features: [
                    "Tặng thêm 10 lượt đổi miễn phí",
                    "Hỗ trợ 24/7 tại mọi trạm",
                    "Quản lý lịch sử đổi pin chi tiết",
                ],
                buttonText: "Đăng ký ngay",
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-purple-100 animate-gradientSlow text-white flex flex-col items-center py-16">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                Gói dịch vụ trạm đổi pin
            </h1>

            <p className="text-gray-400 mb-8">
                Chọn gói phù hợp để tối ưu chi phí và trải nghiệm sạc pin xe điện của bạn
            </p>

            {/* Toggle giữa Dung lượng và Số lần */}
            <div className="relative flex bg-gray-800 rounded-full p-2 mb-10 w-[320px]">
                {["Dung lượng", "Số lần"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setPlanType(type as any)}
                        className={cn(
                            "relative z-10 flex-1 text-center py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                            planType === type
                                ? "text-white"
                                : "text-gray-300 hover:text-white"
                        )}
                    >
                        {type}
                        {planType === type && (
                            <motion.div
                                layoutId="activeToggle"
                                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full z-[-1]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>


            {/* Các thẻ gói */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-[90%] max-w-6xl">
                {plans[planType].map((plan, i) => (
                    <Card
                        key={i}
                        className={cn(
                            "bg-gray-900 text-white rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] relative overflow-hidden",
                            plan.name === "Theo ngày"
                                ? "border-2 border-gray-400 hover:border-gray-300"
                                : plan.name === "Theo tháng"
                                    ? "border-2 border-yellow-400 hover:border-yellow-300"
                                    : "border-2 border-purple-400 hover:border-purple-300"
                        )}
                    >
                        {/* Header */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold">{plan.name}</h2>
                                <span className="text-sm text-purple-400 font-semibold">{plan.discount}</span>
                            </div>

                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-gray-500 line-through text-sm">{plan.oldPrice}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-4">
                                <div className="text-3xl font-bold">{plan.price}</div>
                                <div className="text-gray-400 text-sm">/ gói</div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="flex-1">
                            <ul className="space-y-2 text-gray-300 text-sm mb-6">
                                {plan.capacity && (
                                    <li>
                                        Dung lượng:{" "}
                                        <span className="text-purple-400 font-semibold">
                                            {plan.capacity}
                                        </span>
                                    </li>
                                )}
                                {plan.swaps && (
                                    <li>
                                        Số lượt đổi:{" "}
                                        <span className="text-purple-400 font-semibold">
                                            {plan.swaps}
                                        </span>
                                    </li>
                                )}
                                {plan.features.map((f, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        ⚡ <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Button */}
                        <Button
                            variant="default"
                            className="w-full py-3 rounded-xl font-semibold text-white 
                                bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400
                                hover:from-pink-500 hover:to-yellow-400 
                                hover:scale-[1.03] hover:shadow-lg hover:shadow-pink-500/40
                                transition-all duration-300 shadow-md shadow-purple-500/30"
                        >
                            {plan.buttonText}
                        </Button>

                    </Card>
                ))}
            </div>
        </div>
    );
}
