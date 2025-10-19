import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminVehicleList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    const vehicleData = [
        {
            id: "VX-1201",
            license: "59A1-123.45",
            brand: "VinFast",
            model: "VF e34",
            batteryType: "Lithium-ion 45Ah",
            owner: "Nguyễn Văn A",
            station: "Trạm Quận 7",
            swaps: 12,
            lastSwap: "2025-10-15",
            mileage: "18,000 km",
            registerDate: "2024-02-10",
        },
        {
            id: "VX-1145",
            license: "60B2-789.01",
            brand: "DatBike",
            model: "Weaver++",
            batteryType: "Lithium 35Ah",
            owner: "Lê Thị B",
            station: "Trạm Bình Thạnh",
            swaps: 5,
            lastSwap: "2025-10-09",
            mileage: "9,200 km",
            registerDate: "2024-05-12",
        },
        {
            id: "VX-0988",
            license: "51F1-456.78",
            brand: "Yadea",
            model: "E3",
            batteryType: "Lithium 30Ah",
            owner: "Phạm Minh C",
            station: "Trạm Quận 9",
            swaps: 0,
            lastSwap: "Không có",
            mileage: "2,500 km",
            registerDate: "2023-12-01",
        },
    ];

    // Lọc theo ID, Model, Hãng xe
    const filteredVehicles = vehicleData.filter(
        (v) =>
            v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center text-gray-900">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Danh sách xe
            </h1>

            <Card className="w-[90%] max-w-6xl bg-white shadow-lg rounded-2xl p-6">
                {/* Thanh tìm kiếm */}
                <div className="flex mb-6">
                    <Input
                        placeholder="🔍 Tìm theo ID, Model hoặc Hãng xe..."
                        className="w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Bảng danh sách xe */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left">Mã xe</th>
                                <th className="py-3 px-4 text-left">Biển số</th>
                                <th className="py-3 px-4 text-left">Hãng xe</th>
                                <th className="py-3 px-4 text-left">Model</th>
                                <th className="py-3 px-4 text-left">Loại pin</th>
                                <th className="py-3 px-4 text-left">Chủ xe</th>
                                <th className="py-3 px-4 text-left">Trạm đổi pin</th>
                                <th className="py-3 px-4 text-center">Số lượt đổi</th>
                                <th className="py-3 px-4 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((v, i) => (
                                    <tr
                                        key={i}
                                        className="border-t hover:bg-purple-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">{v.id}</td>
                                        <td className="py-3 px-4">{v.license}</td>
                                        <td className="py-3 px-4">{v.brand}</td>
                                        <td className="py-3 px-4">{v.model}</td>
                                        <td className="py-3 px-4">{v.batteryType}</td>
                                        <td className="py-3 px-4">{v.owner}</td>
                                        <td className="py-3 px-4">{v.station}</td>
                                        <td className="py-3 px-4 text-center">{v.swaps}</td>
                                        <td className="py-3 px-4 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                                                onClick={() => setSelectedVehicle(v)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center py-4 text-gray-500">
                                        Không tìm thấy xe phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Chi Tiết Xe */}
            <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Thông tin chi tiết xe</DialogTitle>
                    </DialogHeader>

                    {selectedVehicle && (
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p><strong>Mã xe:</strong> {selectedVehicle.id}</p>
                            <p><strong>Biển số:</strong> {selectedVehicle.license}</p>
                            <p><strong>Hãng xe:</strong> {selectedVehicle.brand}</p>
                            <p><strong>Model:</strong> {selectedVehicle.model}</p>
                            <p><strong>Loại pin:</strong> {selectedVehicle.batteryType}</p>
                            <p><strong>Chủ xe:</strong> {selectedVehicle.owner}</p>
                            <p><strong>Trạm đổi pin:</strong> {selectedVehicle.station}</p>
                            <p><strong>Số lượt đổi:</strong> {selectedVehicle.swaps}</p>
                            <p><strong>Lần đổi gần nhất:</strong> {selectedVehicle.lastSwap}</p>
                            <p><strong>Ngày đăng ký:</strong> {selectedVehicle.registerDate}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
