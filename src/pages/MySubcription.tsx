"use client";

import { useState } from "react";
import Header from "@/components/Header";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MySubscription() {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header onMenuClick={() => console.log("Menu clicked")} />

            <div className="flex mt-8 px-10 gap-6">
                {/* Sidebar bên trái */}
                <div className="w-1/4 border-r pr-6">
                    <h2 className="font-semibold text-lg mb-4 text-[#38A3A5]">
                        Gói thuê bao của tôi
                    </h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="hover:text-[#38A3A5] cursor-pointer">Đổi mật khẩu</li>
                        <li className="hover:text-[#38A3A5] cursor-pointer">Hỗ trợ</li>
                    </ul>
                </div>

                {/* Nội dung bên phải */}
                <div className="flex-1 bg-white shadow-md rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-[#38A3A5]">
                        Gói thuê bao của tôi
                    </h2>

                    <div className="border p-4 rounded-xl">
                        <div className="flex justify-between mb-3">
                            <p className="font-semibold text-gray-700">Tên gói thuê bao:</p>
                            <p>SwapNet Premium</p>
                        </div>
                        <div className="flex justify-between mb-3">
                            <p className="font-semibold text-gray-700">Mô tả:</p>
                            <p>Gói đổi pin không giới hạn</p>
                        </div>
                        <div className="flex justify-between mb-3">
                            <p className="font-semibold text-gray-700">Dung lượng gói:</p>
                            <p>100kWh/tháng</p>
                        </div>
                        <div className="flex justify-between mb-3">
                            <p className="font-semibold text-gray-700">Dung lượng còn lại:</p>
                            <p>25kWh</p>
                        </div>
                        <div className="flex justify-between mb-3">
                            <p className="font-semibold text-gray-700">Ngày đăng ký:</p>
                            <p>18/10/2025</p>
                        </div>
                        <div className="flex justify-between mb-3">
                            <p className="font-semibold text-gray-700">Ngày hết hạn:</p>
                            <p>18/11/2025</p>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                className="bg-[#38A3A5] hover:bg-[#2d898a] text-white"
                                onClick={() => setOpen(true)}
                            >
                                Quản lý
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Quản lý Gói */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>SwapNet - Gói thuê bao</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 text-gray-700">
                        <p>
                            <span className="font-semibold">Khoản phí sắp tới:</span> 100k/tháng
                        </p>
                        <p>
                            <span className="font-semibold">Ngày bắt đầu:</span> 18/10/2025
                        </p>
                        <p>
                            <span className="font-semibold">Phương thức thanh toán:</span>{" "}
                            MoMo e-wallet
                        </p>
                    </div>

                    <DialogFooter className="flex justify-between mt-6">
                        <Button
                            variant="destructive"
                            onClick={() => alert("Đã hủy gói")}
                        >
                            Hủy gói
                        </Button>
                        <Button
                            className="bg-[#38A3A5] hover:bg-[#2d898a] text-white"
                            onClick={() => alert("Nâng cấp/Hạ cấp gói")}
                        >
                            Nâng cấp / Hạ cấp gói
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
