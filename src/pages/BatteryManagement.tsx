import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { Battery } from "@/types/battery";
import type { BatteryType } from "@/types/batteryType";
import { useStation } from "@/context/StationContext";

export default function BatteryManagement() {
  const { user } = useAuth();
  const role = user?.role;

  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [batteryTypes, setBatteryTypes] = useState<BatteryType[]>([]);
  const {fetchAllStation,stations}=useStation();

  const [searchId, setSearchId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Lấy danh sách pin
  const fetchBatteries = async () => {
    try {
      const res = await api.get("/batteries", { withCredentials: true });
      setBatteries(res.data.data.batteries);
      console.log(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách pin:", err);
    }
  };

  // Lấy danh sách loại pin
  const fetchBatteryTypes = async () => {
    try {
      const res = await api.get("/battery-types", { withCredentials: true });
      setBatteryTypes(res.data.data.batteryTypes);
      console.log(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách loại pin:", err);
    }
  };

  useEffect(() => {
    fetchBatteries();
    fetchBatteryTypes();
    fetchAllStation();
    
  }, []);



  // Map nhanh id => name
  const typeMap: Record<string, string> = Object.fromEntries(
    batteryTypes.map((bt) => [bt.id, bt.name])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 font-semibold"; // Sẵn sàng
      case "in_use":
        return "text-orange-500 font-semibold"; // Đang sử dụng
      case "in_charged":
        return "text-blue-500 font-semibold"; // Đang sạc
      case "faulty":
        return "text-red-500 font-semibold"; // Lỗi
      case "in_transit":
        return "text-purple-500 font-semibold"; // Đang vận chuyển
      default:
        return "text-gray-500 font-semibold"; // Không xác định
    }
  };

  // Filter danh sách pin
  const filteredList = batteries.filter((pin) => {
    const typeName = typeMap[pin.batteryTypeId] || "";
    return (
      pin.code.toLowerCase().includes(searchId.toLowerCase()) &&
      (filterType ? typeName === filterType : true) &&
      (filterStatus ? pin.status === filterStatus : true)
    );
  });

  //lấy tên trạm theo id pin
  const getStationName=(id:string)=>{
    const st=stations.find((s)=>s.id===id);
    return st?st.name:"không xác định";
  };

  // Các hàm action demo
  const handleAdd = () => alert("Thêm pin mới");
  const handleEdit = (id: string) => alert(`Sửa pin ${id}`);
  const handleDelete = (id: string) => alert(`Xóa pin ${id}`);
  const handleMarkFault = (id: string) => alert(`Đánh dấu lỗi pin ${id}`);

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
        Quản lý Pin
      </h2>

      <div className="p-4 space-y-4">
        {/* Search + Filter */}
        <div className="flex items-center gap-2 flex-wrap">
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

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="">Loại pin</option>
            {batteryTypes.map((bt) => (
              <option key={bt.id} value={bt.name}>
                {bt.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="available"> Sẵn sàng</option>
            <option value="in_use"> Đang sử dụng</option>
            <option value="charging"> Đang sạc</option>
            <option value="in_transit"> Đang vận chuyển</option>
            <option value="faulty"> Lỗi</option>
          </select>

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

          <span className="ml-auto font-semibold text-sm">
            Số lượng: {filteredList.length}
          </span>

          {role === "admin" && (
            <button
              onClick={handleAdd}
              className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 text-sm"
            >
              <FaPlus /> Thêm
            </button>
          )}
        </div>

        {/* Table */}
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
            {filteredList.map((pin, idx) => {
              const typeName = typeMap[pin.batteryTypeId] || "";
              return (
                <tr key={pin.id} className="border-b hover:bg-gray-100">
                  <td className="px-2 py-1">{idx + 1}</td>
                  <td className="px-2 py-1">{pin.code}</td>
                  <td className="px-2 py-1">{typeName}</td>
                  <td className="px-2 py-1">{pin.currentCapacity}</td>
                  <td className="px-2 py-1">{pin.soc}%</td>
                  <td className="px-2 py-1">{pin.cycleCount}</td>
                  <td className={`px-2 py-1 ${getStatusColor(pin.status)}`}>
                    {pin.status}
                  </td>
                  <td className="px-2 py-1">{getStationName(pin.stationId)}</td>
                  <td className="px-2 py-1">{pin.manufacturedAt}</td>
                  <td className="px-2 py-1">
                    <div className="flex items-center justify-center gap-2">
                      {role === "staff" && (
                        <button
                          onClick={() => handleMarkFault(pin.id)}
                          className="text-red-500 hover:underline"
                        >
                          Đánh dấu lỗi
                        </button>
                      )}
                      {role === "admin" && (
                        <>
                          <button
                            onClick={() => handleEdit(pin.id)}
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(pin.id)}
                            className="text-red-500 hover:underline flex items-center gap-1"
                          >
                            <FaTrash /> Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
