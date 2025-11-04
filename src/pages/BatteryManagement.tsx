import { useEffect, useMemo, useState } from "react";
import BatteryFilterBar from "@/components/BatteryManagement/BatteryFilterBar";
import AddBatteryForm from "@/components/BatteryManagement/AddBatteryForm";
import BatteryTable from "@/components/BatteryManagement/BatteryTable";
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
  voltage?: number;
  temperature?: number;
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
    voltage: undefined,
    temperature: undefined,
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
      console.log("battery", res.data);
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
        voltage: editingBattery.voltage,
        temperature: editingBattery.temperature,
        status: editingBattery.status,
        batteryTypeId: editingBattery.batteryType?.id, // lấy id từ object
        stationId: editingBattery.stationId,
      };

      console.debug("handleSave: updatedData=", updatedData);

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
        voltage: undefined,
        temperature: undefined,
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

      <BatteryFilterBar
        searchId={searchId}
        setSearchId={setSearchId}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterStation={filterStation}
        setFilterStation={setFilterStation}
        batteryTypes={batteryTypes}
        stations={stations}
        role={role}
        onClear={() => {
          setSearchId("");
          setFilterType("");
          setFilterStatus("");
          setFilterStation("all");
        }}
        onToggleAdd={() => setShowAddForm((s) => !s)}
        showAddForm={showAddForm}
      />

      {showAddForm && (
        <AddBatteryForm
          batteryTypes={batteryTypes}
          stations={stations}
          newBattery={newBattery}
          setNewBattery={setNewBattery}
          handleAddBattery={handleAddBattery}
        />
      )}

      <BatteryTable
        currentPageData={currentPageData}
        page={page}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        editingBattery={editingBattery}
        setEditingBattery={setEditingBattery}
        batteryTypes={batteryTypes}
        stations={stations}
        stationMap={stationMap}
        getStatusColor={getStatusColor}
        role={role}
        handleSave={handleSave}
        handleDelete={handleDelete}
        markFaulty={markFaulty}
      />

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
