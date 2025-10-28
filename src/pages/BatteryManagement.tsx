import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { Battery } from "@/types/battery";
import type { BatteryType } from "@/types/batteryType";
import { useStation } from "@/context/StationContext";
import { toast } from "sonner";

interface NewBattery {
  code: string;
  batteryTypeId: string;
  currentCapacity?: number;
  soc?: number;
  cycleCount?: number;
  status: string;
  stationId: string;
  manufacturedAt: string;
}

export default function BatteryManagement() {
  const { user } = useAuth();
  const role = user?.role.name;

  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [batteryTypes, setBatteryTypes] = useState<BatteryType[]>([]);
  const { fetchAllStation, stations = [] } = useStation();

  const [searchId, setSearchId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStation, setFilterStation] = useState("all");
  const [editingBattery, setEditingBattery] = useState<Battery | null>(null);

  //them pin
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBattery, setNewBattery] = useState<NewBattery>({
    code: "",
    batteryTypeId: "",
    currentCapacity: undefined,
    soc: undefined,
    cycleCount: undefined,
    status: "",
    stationId: "",
    manufacturedAt: "",
  });

  // Phân trang
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Fetch dữ liệu pin & loại pin
  const fetchBatteries = async () => {
    try {
      const res = await api.get("/batteries", { withCredentials: true });
      setBatteries(res.data.data);
      console.log("battery",res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách pin:", err);
    }
  };

  const fetchBatteryTypes = async () => {
    try {
      const res = await api.get("/battery-types", { withCredentials: true });
      setBatteryTypes(res.data.data.batteryTypes);
    } catch (err) {
      console.error("Lỗi lấy danh sách loại pin:", err);
    }
  };
}


// Kiểu dữ liệu Trạm
interface Station {
  id: string;
  name: string;
  address: string;
  status: string;
  slotCapacity?: number;
  batteries: Battery[];
}

// Map trạng thái pin → hiển thị
const statusMap = {
  available: { label: "Có thể dùng", textColor: "text-green-700", bgColor: "bg-green-100", boldColor: "text-green-800" },
  in_charged: { label: "Đang sạc", textColor: "text-blue-700", bgColor: "bg-blue-100", boldColor: "text-blue-800" },
  reserved: { label: "Được đặt trước", textColor: "text-purple-700", bgColor: "bg-purple-100", boldColor: "text-purple-800" },
  in_use: { label: "Đang sử dụng", textColor: "text-yellow-700", bgColor: "bg-yellow-100", boldColor: "text-yellow-800" },
  faulty: { label: "Pin lỗi", textColor: "text-red-700", bgColor: "bg-red-100", boldColor: "text-red-800" },
};

export default function BatteryManagement() {
  const { user } = useAuth();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchCode, setSearchCode] = useState(""); // tìm kiếm theo mã pin
  const [filterStatus, setFilterStatus] = useState<Battery["status"] | "all">("all"); // lọc trạng thái

  const getStatusText = (status: Battery["status"]) => statusMap[status]?.label || "Không xác định";
  const getStatusClass = (status: Battery["status"]) => statusMap[status]?.textColor || "text-gray-600";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //  Lấy trạm
        const stationRes = await api.get("/stations", { withCredentials: true });
        const stationData: Station = stationRes.data.data.stations;

        if (!stationData) {
          toast.error("Không tìm thấy dữ liệu trạm!");
          setStation(null);
          return;
        }

        //  Lấy danh sách pin đầy đủ (có batteryType)
        const batteriesRes = await api.get("/batteries", { withCredentials: true });
        const batteries: Battery[] = batteriesRes.data.data ?? [];

        //  Lọc pin thuộc trạm hiện tại
        const stationBatteries = batteries.filter(b => b.stationId === stationData.id);

        setStation({ ...stationData, batteries: stationBatteries });
      } catch (error: any) {
        console.error("Lỗi fetch dữ liệu:", error);
        toast.error("Không thể tải dữ liệu trạm hoặc pin!");
        setStation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="p-8 bg-[#E9F8F8] min-h-screen">
      <h1 className="text-4xl text-center font-bold mb-10 text-[#2C8C8E]">Quản Lý Pin Tại Trạm</h1>

      {loading && <p className="text-center text-gray-500">Đang tải...</p>}

      {!loading && !station && (
        <p className="text-center text-red-500 font-semibold">Không tìm thấy dữ liệu trạm.</p>
      )}

      {!loading && station && (
        <>
          <Card className="p-6 mb-10 shadow-lg bg-white text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-[#007577]">{station.name}</h2>
            {station.address && <p className="text-gray-600 mt-1 font-medium">📍 {station.address}</p>}
            {station.status && (
              <p className="mt-2 font-semibold text-gray-700">
                Trạng thái: <span className="text-green-700 uppercase">{station.status}</span>
              </p>
            )}
            {station.slotCapacity !== undefined && (
              <p className="mt-1 text-gray-700 font-medium">Slot: {station.slotCapacity} </p>
            )}

            {/* Tổng quan số lượng pin */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-6 text-sm font-medium">
              {Object.keys(statusMap).map(key => {
                const k = key as Battery["status"];
                return (
                  <div key={k} className={`${statusMap[k].bgColor} p-3 rounded-lg`}>
                    <p className={statusMap[k].textColor}>{statusMap[k].label}</p>
                    <p className={`font-bold text-lg ${statusMap[k].boldColor}`}>
                      {(station.batteries || []).filter(b => b.status === k).length}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-gray-900 font-bold">📦 Tổng số pin: {station.batteries?.length || 0}</p>
          </Card>

          {/* Danh sách pin */}
          <h2 className="text-xl font-bold text-[#2C8C8E] mb-5">Danh Sách Pin</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-[#2C8C8E] text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Mã Pin</th>
                  <th className="py-3 px-4 text-left">Loại Pin</th>
                  <th className="py-3 px-4 text-left">Dung lượng</th>
                  <th className="py-3 px-4 text-left">SOC</th>
                  <th className="py-3 px-4 text-left">CycleCount</th>
                  <th className="py-3 px-4 text-left">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {(station.batteries || []).map(batt => (
                  <tr key={batt.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{batt.code}</td>
                    <td className="py-3 px-4">{batt.batteryType?.name || "-"}</td>
                    <td className="py-3 px-4">{batt.currentCapacity}</td>
                    <td className="py-3 px-4">{batt.soc}</td>
                    <td className="py-3 px-4">{batt.cycleCount}</td>
                    <td className={`py-3 px-4 font-semibold ${getStatusClass(batt.status)}`}>
                      {getStatusText(batt.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

  useEffect(() => {
    fetchBatteries();
    fetchBatteryTypes();
    fetchAllStation();
  }, []);

  // Tạo map id → tên trạm
  const stationMap = useMemo(() => {
    return Object.fromEntries(stations.map((s) => [s.id, s.name]));
  }, [stations]);

  // Màu trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 font-semibold";
      case "in_use":
        return "text-orange-500 font-semibold";
      case "charging":
        return "text-blue-500 font-semibold";
      case "faulty":
        return "text-red-500 font-semibold";
      case "in_transit":
        return "text-purple-500 font-semibold";
      case "reserved":
        return "text-yellow-500 font-semibold";
      default:
        return "text-gray-500 font-semibold";
    }
  };

  // Lọc danh sách pin
  const filteredList = batteries.filter((pin) => {
    const typeName = pin.batteryType?.name || "";
    const matchSearch = (pin.code || "")
      .toLowerCase()
      .includes(searchId.toLowerCase());
    const matchType = filterType ? typeName === filterType : true;
    const matchStatus = filterStatus ? pin.status === filterStatus : true;
    const matchStation =
      filterStation === "all" ? true : pin.stationId === filterStation;
    return matchSearch && matchType && matchStatus && matchStation;
  });

  // Tính phân trang
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const currentPageData = filteredList.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Lưu cập nhật pin
  const handleSave = async () => {
    if (!editingBattery) return;
    try {
      const updatedData = {
        code: editingBattery.code,
        currentCapacity: editingBattery.currentCapacity,
        manufacturedAt: new Date(editingBattery.manufacturedAt).toISOString(), // giữ đúng format yyyy-mm-dd
        cycleCount: editingBattery.cycleCount,
        soc: editingBattery.soc,
        status: editingBattery.status,
        batteryTypeId: editingBattery.batteryType?.id, // lấy id từ object
        stationId: editingBattery.stationId,
      };

      await api.patch(`/batteries/${editingBattery.id}`, updatedData, {
        withCredentials: true,
      });
      toast.success("Cập nhật pin thành công!");
      setEditingBattery(null);
      fetchBatteries();
    } catch (err) {
      console.error("Lỗi cập nhật pin:", err);
      toast.error("Không thể lưu thay đổi!");
    }
  };

  const handleAddBattery = async () => {
    // Các trường bắt buộc (trừ status)
    const requiredFields: (keyof NewBattery)[] = [
      "code",
      "currentCapacity",
      "manufacturedAt",
      "cycleCount",
      "soc",
      "batteryTypeId",
      "stationId",
    ];

    // Kiểm tra trường nào bị thiếu
    const missingFields = requiredFields.filter(
      (field) => !newBattery[field] && newBattery[field] !== 0
    );

    if (missingFields.length > 0) {
      alert("⚠️ Vui lòng nhập đầy đủ tất cả thông tin.");
      return;
    }

    const batteryToAdd = {
      ...newBattery,
      status: newBattery.status?.trim() || "available", // Mặc định available
    };
    try {
      // setLoading(true);
      const res = await api.post("/batteries", batteryToAdd, {
        withCredentials: true,
      });
      const added = res.data.data.battery;
      console.log(res.data);
      // Cập nhật danh sách pin
      setBatteries((prev) => [...prev, added]);

      // Reset form
      setNewBattery({
        code: "",
        batteryTypeId: "",
        currentCapacity: 0,
        soc: 0,
        cycleCount: 0,
        status: "",
        stationId: "",
        manufacturedAt: "",
      });

      setShowAddForm(false);
      toast.success(" Thêm pin mới thành công!");
    } catch (error: any) {
      console.error("Error adding battery:", error);
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 400:
            toast.error(" Dữ liệu không hợp lệ hoặc mã pin đã tồn tại.");
            break;
          case 401:
            toast.error("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
            break;
          case 403:
            toast.error(" Bạn không có quyền thực hiện thao tác này.");
            break;
          case 404:
            toast.error(" Không tìm thấy endpoint hoặc dữ liệu liên quan.");
            break;
          case 500:
            toast.error(" Lỗi máy chủ. Vui lòng thử lại sau.");
            break;
          default:
            toast.error(`Lỗi không xác định (mã ${status}).`);
        }
      } else {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
      }
    } finally {
      // setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa pin này không?")) return;
    try {
      await api.delete(`batteries/${id}`);
      toast.success("Xóa pin thành công!");
      fetchBatteries();
    } catch {
      toast.error("Lỗi khi xóa pin!");
    }
  };

  const markFaulty = async (id: string) => {
    try {
      await api.patch(
        `/batteries/${id}`,
        { status: "faulty" },
        { withCredentials: true }
      );
      toast.info("Đã đánh dấu pin lỗi!");
      fetchBatteries();
    } catch (err: any) {
      toast.error("Không thể đánh dấu lỗi!");
      console.log("không đánh dấu lỗi được", err);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
        Quản lý Pin
      </h2>

      {/* Thanh tìm kiếm & lọc */}
      <div className="flex items-center gap-2 flex-wrap p-4">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Nhập mã pin..."
            className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Lọc loại pin */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-300"
        >
          <option value="">Loại pin</option>
          {batteryTypes.map((bt) => (
            <option key={bt.id} value={bt.name}>
              {bt.name}
            </option>
          ))}
        </select>

        {/* Lọc trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-200"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">available</option>
          <option value="in_use">in_use</option>
          <option value="in_charged">in_charged</option>
          <option value="in_transit">in_transit</option>
          <option value="faulty">faulty</option>
          <option value="reserved">reserved</option>
        </select>

        {role === "admin" && (
          <>
            {/* Lọc theo trạm */}
            <select
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-200"
            >
              <option value="all">Tất cả trạm</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          onClick={() => {
            setSearchId("");
            setFilterType("");
            setFilterStatus("");
            setFilterStation("all");
          }}
          className="bg-[#38A3A5] text-white px-3 py-1 rounded hover:bg-[#246B45] text-sm"
        >
          Làm mới
        </button>

        {role === "admin" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <FaPlus /> {showAddForm ? "Đóng" : "Thêm pin"}
          </button>
        )}
      </div>

      {/* Form thêm pin */}
      {showAddForm && (
        <div className="border p-4 rounded-md bg-[#F8FFFD]">
          <h3 className="font-semibold mb-3 text-[#38A3A5]">Thêm pin mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mã pin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã pin
              </label>
              <input
                placeholder="Nhập mã pin"
                value={newBattery.code}
                onChange={(e) =>
                  setNewBattery({ ...newBattery, code: e.target.value })
                }
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Loại pin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại pin
              </label>
              <select
                value={newBattery.batteryTypeId}
                onChange={(e) =>
                  setNewBattery({
                    ...newBattery,
                    batteryTypeId: e.target.value,
                  })
                }
                className="border rounded px-2 py-1 w-full text-sm"
              >
                <option value="">Chọn loại pin</option>
                {batteryTypes.map((bt) => (
                  <option key={bt.id} value={bt.id}>
                    {bt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạm
              </label>
              <select
                value={newBattery.stationId}
                onChange={(e) =>
                  setNewBattery({ ...newBattery, stationId: e.target.value })
                }
                className="border rounded px-2 py-1 w-full text-sm"
              >
                <option value="">Chọn trạm</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dung lượng hiện tại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dung lượng hiện tại (mAh)
              </label>
              <input
                type="number"
                placeholder="Nhập số dung lượng"
                value={newBattery.currentCapacity ?? ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  if (value !== undefined && value < 0) return;
                  setNewBattery({ ...newBattery, currentCapacity: value });
                }}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Số chu kỳ sạc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số chu kỳ sạc
              </label>
              <input
                type="number"
                placeholder="Nhập số chu kỳ"
                value={newBattery.cycleCount ?? ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  if (value !== undefined && value < 0) return;
                  setNewBattery({ ...newBattery, cycleCount: value });
                }}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>

            {/* SOC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SOC (%)
              </label>
              <input
                type="number"
                placeholder="Nhập SOC (0–100)"
                value={newBattery.soc ?? ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  if (value !== undefined && (value < 0 || value > 100)) return; // chỉ cho 0–100
                  setNewBattery({ ...newBattery, soc: value });
                }}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Ngày sản xuất */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sản xuất
              </label>
              <input
                type="date"
                max={
                  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .split("T")[0]
                }
                value={newBattery.manufacturedAt}
                onChange={(e) => {
                  const selected = e.target.value;
                  const today = new Date().toISOString().split("T")[0];

                  if (selected > today) {
                    alert("Không thể chọn ngày trong tương lai!");
                    return; // Không cập nhật state
                  }

                  setNewBattery({
                    ...newBattery,
                    manufacturedAt: selected,
                  });
                }}
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={newBattery.status || "available"}
                onChange={(e) =>
                  setNewBattery({ ...newBattery, status: e.target.value })
                }
                className="border rounded px-2 py-1 w-full text-sm"
              >
                <option value="available">available</option>
                <option value="in_use">in_use</option>
                <option value="in_charged">in_charged</option>
                <option value="in_transit">in_transit</option>
                <option value="faulty">faulty</option>
                <option value="reserved">reserved</option>
              </select>
            </div>
          </div>

          {/* Nút lưu */}
          <div className="mt-4 flex justify-end">
            <button
              disabled={
                !newBattery.code.trim() ||
                !newBattery.batteryTypeId ||
                !newBattery.stationId ||
                newBattery.currentCapacity === undefined ||
                newBattery.cycleCount === undefined ||
                newBattery.soc === undefined ||
                !newBattery.manufacturedAt
              }
              onClick={() => handleAddBattery()}
              className={`px-4 py-1 rounded text-sm text-white transition ${
                !newBattery.code ||
                !newBattery.batteryTypeId ||
                !newBattery.stationId ||
                newBattery.currentCapacity === undefined ||
                newBattery.cycleCount === undefined ||
                newBattery.soc === undefined ||
                !newBattery.manufacturedAt
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#38A3A5] hover:bg-[#2C7A7B]"
              }`}
            >
              Lưu pin mới
            </button>
          </div>
        </div>
      )}

      {/* Bảng hiển thị pin */}
      <p className="text-gray-600 text-right">
        Tổng số pin:{" "}
        <span className="font-medium text-[#38A3A5] ">
          {filteredList.length}
        </span>
      </p>

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
            ].map((h) => (
              <th key={h} className="border px-2 py-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((pin, idx) => {
          const isEditing = editingBattery?.id === pin.id;
            const date = pin.manufacturedAt?.split("T")[0];

            return (
              <tr key={pin.id} className="border-b hover:bg-gray-100">
                <td>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                <td>
                  {isEditing ? (
                    <input
                      value={editingBattery.code}
                      onChange={(e) =>
                        setEditingBattery({
                          ...editingBattery,
                          code: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-24 text-sm"
                    />
                  ) : (
                    pin.code
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      value={editingBattery.batteryType?.id || ""}
                      onChange={(e) => {
                        const selected = batteryTypes.find(
                          (bt) => bt.id === e.target.value
                        );
                        if (selected)
                          setEditingBattery({
                            ...editingBattery,
                            batteryType: selected,
                          });
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {batteryTypes.map((bt) => (
                        <option key={bt.id} value={bt.id}>
                          {bt.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    pin.batteryType?.name
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editingBattery.currentCapacity}
                      onChange={(e) =>
                        setEditingBattery({
                          ...editingBattery,
                          currentCapacity: Number(e.target.value),
                        })
                      }
                      className="border rounded px-2 py-1 w-24 text-sm"
                    />
                  ) : (
                    pin.currentCapacity
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editingBattery.soc}
                      min={0}
                      onChange={(e) =>
                        setEditingBattery({
                          ...editingBattery,
                          soc: Number(e.target.value),
                        })
                      }
                      className="border rounded px-2 py-1 w-16 text-sm"
                    />
                  ) : (
                    `${pin.soc}%`
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editingBattery.cycleCount}
                      onChange={(e) =>
                        setEditingBattery({
                          ...editingBattery,
                          cycleCount: Number(e.target.value),
                        })
                      }
                      className="border rounded px-2 py-1 w-16 text-sm"
                    />
                  ) : (
                    pin.cycleCount
                  )}
                </td>

                <td>
                  {isEditing ? (
                    (() => {
                      const current = editingBattery.status;

                      // Quy định chuyển trạng thái được phép
                      const allowedTransitions: Record<string, string[]> = {
                        available: [
                          "in_use",
                          "in_transit",
                          "faulty",
                          "reserved",
                        ],
                        in_use: ["in_charged", "faulty"],
                        in_charged: ["available", "faulty"],
                        in_transit: ["available", "faulty"],
                        faulty: ["available"],
                        reserved: ["available", "in_use", "faulty"], // Không có in_transit
                      };

                      // Lấy danh sách trạng thái cho phép, gồm cả current (để hiển thị)
                      const allowedStatuses = [
                        current,
                        ...(allowedTransitions[current] || []),
                      ].filter((v, i, a) => a.indexOf(v) === i); // unique

                      return (
                        <select
                          value={editingBattery.status}
                          onChange={(e) =>
                            setEditingBattery({
                              ...editingBattery,
                              status: e.target.value,
                            })
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {allowedStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      );
                    })()
                  ) : (
                    <span className={getStatusColor(pin.status)}>
                      {pin.status}
                    </span>
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      value={editingBattery.stationId}
                      onChange={(e) =>
                        setEditingBattery({
                          ...editingBattery,
                          stationId: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {stations.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    stationMap[pin.stationId] || "Không xác định"
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        editingBattery.manufacturedAt
                          ? new Date(
                              editingBattery.manufacturedAt
                            ).toLocaleString("vi-VN")
                          : "Chưa có"
                      }
                      onChange={(e) =>
                        setEditingBattery({
                          ...editingBattery,
                          manufacturedAt: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    date
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 flex items-center gap-1"
                      >
                        <FaSave /> Lưu
                      </button>
                      <button
                        onClick={() => setEditingBattery(null)}
                        className="text-gray-500 flex items-center gap-1"
                      >
                        <FaTimes /> Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      {role === "admin" && (
                        <>
                          <button
                            onClick={() => setEditingBattery(pin)}
                            className="text-blue-500 flex items-center gap-1"
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(pin.id)}
                            className="text-red-600 flex items-center gap-1"
                          >
                            <FaTrash /> Xóa
                          </button>
                        </>
                      )}
                      {role === "staff" && (
                        <button
                          onClick={() => markFaulty(pin.id)}
                          className="text-orange-500 flex items-center gap-1"
                        >
                          <FaTimes /> Đánh dấu lỗi
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50"
        >
          Sau
        </button>
      </div>

    </div>
  );
}
