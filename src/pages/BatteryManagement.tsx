import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function BatteryManagement() {
  const [searchId, setSearchId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fakePinList = [
    {
      id: "B001",
      type: "Li-ion",
      capacity: "5.2 kWh",
      soc: 0.95,
      cycles: 10,
      status: "Available",
      station: "S001",
      manufactureDate: "01/01/2025",
    },
    {
      id: "B002",
      type: "Li-ion",
      capacity: "4.8 kWh",
      soc: 0.9,
      cycles: 12,
      status: "In Use",
      station: "S002",
      manufactureDate: "05/01/2025",
    },
    {
      id: "B003",
      type: "Li-ion",
      capacity: "6 kWh",
      soc: 0.8,
      cycles: 15,
      status: "Fault",
      station: "S003",
      manufactureDate: "10/01/2025",
    },
  ];

  const getStatusColor = (status:string) => {
    switch (status) {
      case "Available":
        return "text-green-600 font-semibold";
      case "In Use":
        return "text-orange-500 font-semibold";
      case "Fault":
        return "text-red-500 font-semibold";
      default:
        return "";
    }
  };

  const filteredList = fakePinList.filter(
    (pin) =>
      pin.id.toLowerCase().includes(searchId.toLowerCase()) &&
      (filterType ? pin.type === filterType : true) &&
      (filterStatus ? pin.status === filterStatus : true)
  );

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
        Quản lý Pin
      </h2>

      <div className="p-4 space-y-4">
        {/* Search + Filter */}
        <div className="flex items-center gap-2">
          {/* Search input ngắn */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập ID..."
              className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter loại pin */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="">Loại pin</option>
            <option value="Li-ion">Li-ion</option>
            <option value="NiMH">NiMH</option>
          </select>

          {/* Filter trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="">Trạng thái</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Fault">Fault</option>
          </select>

          {/* Button reset */}
          <button
            onClick={() => {
              setSearchId("");
              setFilterType("");
              setFilterStatus("");
            }}
            className="bg-[#38A3A5] text-white px-3 py-1 rounded hover:bg-[#246B45] text-sm"
          >
            Lọc
          </button>

          {/* Số lượng pin */}
          <span className="ml-auto font-semibold text-sm">
            Số lượng: {filteredList.length}
          </span>
        </div>

        {/* Table hiển thị */}
        <table className="min-w-full table-auto text-center border-collapse">
          <thead className="bg-[#E6F7F7] text-[#38A3A5]">
            <tr>
              {[
                "STT",
                "Mã Pin",
                "Loại Pin",
                "Dung lượng",
                "SoC",
                "Chu kỳ",
                "Trạng thái",
                "Trạm",
                "Ngày SX",
                "Hành động",
              ].map((header) => (
                <th key={header} className="border px-2 py-1">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredList.map((pin, idx) => (
              <tr key={pin.id} className="border-b hover:bg-gray-100">
                <td className="px-2 py-1">{idx + 1}</td>
                <td className="px-2 py-1">{pin.id}</td>
                <td className="px-2 py-1">{pin.type}</td>
                <td className="px-2 py-1">{pin.capacity}</td>
                <td className="px-2 py-1">{(pin.soc * 100).toFixed(0)}%</td>
                <td className="px-2 py-1">{pin.cycles}</td>
                <td className={`px-2 py-1 ${getStatusColor(pin.status)}`}>
                  {pin.status}
                </td>
                <td className="px-2 py-1">{pin.station}</td>
                <td className="px-2 py-1">{pin.manufactureDate}</td>
                <td className="px-2 py-1">
                  <button className="text-red-500 hover:underline">
                    Đánh dấu lỗi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
