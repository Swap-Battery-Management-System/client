import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function AdminStationManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const fakeStationList = [
        {
            id: "S001",
            name: "Trạm Quận 1",
            city: "TP.HCM",
            address: "123 Nguyễn Huệ, Quận 1",
            capacity: 50, // số pin tối đa
            availableSlots: 12,
            status: "Active",
            manager: "Nguyễn Văn A",
        },
        {
            id: "S002",
            name: "Trạm Quận 2",
            city: "TP.HCM",
            address: "45 Đường số 1, Quận 2",
            capacity: 40,
            availableSlots: 8,
            status: "Inactive",
            manager: "Trần Thị B",
        },
        {
            id: "S003",
            name: "Trạm Quận 3",
            city: "TP.HCM",
            address: "78 Lê Lai, Quận 3",
            capacity: 60,
            availableSlots: 20,
            status: "Active",
            manager: "Lê Văn C",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "text-green-600 font-semibold";
            case "Inactive":
                return "text-red-500 font-semibold";
            default:
                return "";
        }
    };

    const filteredStations = fakeStationList.filter(
        (station) =>
            station.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (filterCity ? station.city === filterCity : true) &&
            (filterStatus ? station.status === filterStatus : true)
    );

    return (
        <div className="p-6 space-y-6 min-h-screen">
            <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
                Quản lý Trạm Pin
            </h2>

            <div className="p-4 space-y-4">
                {/* Search + Filter */}
                <div className="flex items-center gap-2">
                    {/* Search input */}
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nhập ID hoặc tên trạm..."
                            className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Filter city */}
                    <select
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                        <option value="">Thành phố</option>
                        <option value="TP.HCM">TP.HCM</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>

                    {/* Filter status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    >
                        <option value="">Trạng thái</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    {/* Reset button */}
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setFilterCity("");
                            setFilterStatus("");
                        }}
                        className="bg-[#38A3A5] text-white px-3 py-1 rounded hover:bg-[#246B45] text-sm"
                    >
                        Lọc
                    </button>

                    {/* Count */}
                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredStations.length}
                    </span>
                </div>

                {/* Table */}
                <table className="min-w-full table-auto text-center border-collapse">
                    <thead className="bg-[#E6F7F7] text-[#38A3A5]">
                        <tr>
                            {[
                                "STT",
                                "Mã trạm",
                                "Tên trạm",
                                "Thành phố",
                                "Địa chỉ",
                                "Sức chứa",
                                "Slot trống",
                                "Trạng thái",
                                "Người quản lý",
                                "Hành động",
                            ].map((header) => (
                                <th key={header} className="border px-2 py-1">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStations.map((station, idx) => (
                            <tr key={station.id} className="border-b hover:bg-gray-100">
                                <td className="px-2 py-1">{idx + 1}</td>
                                <td className="px-2 py-1">{station.id}</td>
                                <td className="px-2 py-1">{station.name}</td>
                                <td className="px-2 py-1">{station.city}</td>
                                <td className="px-2 py-1">{station.address}</td>
                                <td className="px-2 py-1">{station.capacity}</td>
                                <td className="px-2 py-1">{station.availableSlots}</td>
                                <td className={`px-2 py-1 ${getStatusColor(station.status)}`}>
                                    {station.status}
                                </td>
                                <td className="px-2 py-1">{station.manager}</td>
                                <td className="px-2 py-1 flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                                    >
                                        Xem chi tiết
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-300 hover:bg-green-50"
                                    >
                                        Cập nhật
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
