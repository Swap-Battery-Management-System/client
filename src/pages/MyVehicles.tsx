"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function MyVehicles() {
    const [open, setOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    // 🔹 Dữ liệu tạm
    const vehicles = [
        {
            id: "0b2333e5-149a-4af1-a234-634f84295e89",
            licensePlates: "59A3-456.78",
            VIN: "VF60FELIZS015",
            status: "pending",
            model: {
                name: "Feliz S",
                brand: "VinFast",
                batteryType: "LiFePO4 72V 30Ah",
            },
            createdAt: "2025-10-18",
        },
        {
            id: "8ae238f2-1db4-41cc-b58b-cad1b1c60f5c",
            licensePlates: "51B2-999.66",
            VIN: "VF60KLARA001",
            status: "active",
            model: {
                name: "Klara A1",
                brand: "VinFast",
                batteryType: "Lithium-ion 60V 20Ah",
            },
            createdAt: "2025-09-20",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "text-green-600 font-semibold";
            case "pending":
                return "text-yellow-500 font-semibold";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#38A3A5]">
                Xe của tôi
            </h2>

            <div className="overflow-hidden rounded-xl border bg-white shadow">
                <table className="min-w-full text-left">
                    <thead className="bg-[#38A3A5] text-white">
                        <tr>
                            <th className="px-4 py-3">Biển số</th>
                            <th className="px-4 py-3">Model</th>
                            <th className="px-4 py-3">Hãng</th>
                            <th className="px-4 py-3">Loại pin</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v) => (
                            <tr
                                key={v.id}
                                className="border-b hover:bg-gray-50 transition-all"
                            >
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {v.licensePlates}
                                </td>
                                <td className="px-4 py-3">{v.model.name}</td>
                                <td className="px-4 py-3">{v.model.brand}</td>
                                <td className="px-4 py-3">{v.model.batteryType}</td>
                                <td className={`px-4 py-3 ${getStatusColor(v.status)}`}>
                                    {v.status === "active"
                                        ? "Đã duyệt"
                                        : "Đang chờ duyệt"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Button
                                        className="bg-[#38A3A5] hover:bg-[#2d898a] text-white"
                                        onClick={() => {
                                            setSelectedVehicle(v);
                                            setOpen(true);
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔹 Dialog Chi tiết xe */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Thông tin xe</DialogTitle>
                    </DialogHeader>

                    {selectedVehicle && (
                        <div className="space-y-3 text-gray-700">
                            <p>
                                <span className="font-semibold">Biển số:</span>{" "}
                                {selectedVehicle.licensePlates}
                            </p>
                            <p>
                                <span className="font-semibold">Model:</span>{" "}
                                {selectedVehicle.model.name}
                            </p>
                            <p>
                                <span className="font-semibold">Hãng:</span>{" "}
                                {selectedVehicle.model.brand}
                            </p>
                            <p>
                                <span className="font-semibold">Loại pin:</span>{" "}
                                {selectedVehicle.model.batteryType}
                            </p>
                            <p>
                                <span className="font-semibold">VIN:</span>{" "}
                                {selectedVehicle.VIN}
                            </p>
                            <p>
                                <span className="font-semibold">Trạng thái:</span>{" "}
                                {selectedVehicle.status === "active"
                                    ? "Đã duyệt"
                                    : "Đang chờ duyệt"}
                            </p>
                            <p>
                                <span className="font-semibold">Ngày đăng ký:</span>{" "}
                                {selectedVehicle.createdAt}
                            </p>
                        </div>
                    )}

                    <DialogFooter className="flex justify-end mt-6">
                        <Button
                            className="bg-[#38A3A5] hover:bg-[#2d898a] text-white"
                            onClick={() => setOpen(false)}
                        >
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
