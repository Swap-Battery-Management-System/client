import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BookingHistoryItem {
  id: string;
  customerName: string;
  station: string;
  vehicleName: string;
  licensePlates: string;
  batteryType: string;
  scheduleTime: string;
  note?: string;
  status:
    | "Đã đặt lịch"
    | "Đang chờ tìm pin"
    | "Đang đổi pin"
    | "Đã hoàn thành"
    | "Hủy đặt lịch"
    | "Quá hạn";
}

interface Vehicle {
  id: string;
  name: string;
  licensePlates: string;
  VIN?: string;
  status?: string;
  modelId?: string;
  userId?: string;
  batteryId?: string | null;
  batteryType?: string;
  model?: {
    id: string;
    name: string;
    brand: string;
    batteryTypeId: string;
    batteryType?: {
      id: string;
      name: string;
      designCapacity?: string;
      price?: string;
    };
  };
}

interface Station {
  id: string;
  name: string;
  address: string;
}

export default function BookingHistory() {
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bộ lọc và phân trang
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "Đang tiến hành" | "Đã kết thúc"
  >("Đang tiến hành");
  const [sortStatus, setSortStatus] = useState<
    "Tất cả" | "Đã hoàn thành" | "Hủy đặt lịch" | "Quá hạn"
  >("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  const [stationsMap, setStationsMap] = useState<Map<string, string>>(
    new Map()
  );
  const [vehiclesMap, setVehiclesMap] = useState<Map<string, Vehicle>>(
    new Map()
  );

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [userRes, vehicleRes, stationRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/vehicles"),
          api.get("/stations"),
        ]);

        // User
        const user = userRes.data.data.user;
        const userMap = new Map<string, string>([
          [user.id, user.name || user.email],
        ]);
        setUsersMap(userMap);

        // Vehicles
        const vehicles: Vehicle[] = vehicleRes.data.data.vehicles;
        const vehicleMap = new Map<string, Vehicle>(
          vehicles.map((v) => [
            v.id,
            {
              ...v,
              batteryType: v.model?.batteryType?.name || "Chưa có",
            },
          ])
        );
        setVehiclesMap(vehicleMap);

        // Stations
        const stations: Station[] = stationRes.data.data.stations;
        const stationMap = new Map<string, string>(
          stations.map((s) => [s.id, s.name])
        );
        setStationsMap(stationMap);
      } catch (err) {
        console.error("Fetch resources error:", err);
        toast.error("Không thể tải dữ liệu người dùng, xe hoặc trạm");
      }
    };

    fetchResources();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      const bookings = res.data.data.bookings || [];
      console.log(res.data);
      const mappedData: BookingHistoryItem[] = bookings.map((b: any) => {
        const vehicle = vehiclesMap.get(b.vehicleId);
        return {
          id: b.id,
          customerName: usersMap.get(b.userId) || b.userId,
          station: stationsMap.get(b.stationId) || b.stationId,
          vehicleName: vehicle?.name || b.vehicleId,
          licensePlates: vehicle?.licensePlates || "N/A",
          batteryType: vehicle?.batteryType || "-",
          scheduleTime: b.scheduleTime || "",
          note: b.note,
          status:
            b.status === "scheduled"
              ? "Đã đặt lịch"
              : b.status === "pending"
              ? "Đang chờ tìm pin"
              : b.status === "in_process"
              ? "Đang đổi pin"
              : b.status === "completed"
              ? "Đã hoàn thành"
              : b.status === "canceled"
              ? "Hủy đặt lịch"
              : "Quá hạn",
        };
      });

      setHistory(mappedData);
    } catch (err) {
      toast.error("Không thể tải lịch sử đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usersMap.size && vehiclesMap.size && stationsMap.size) {
      fetchBookings();
    }
  }, [usersMap, vehiclesMap, stationsMap]);

  // Lọc và sắp xếp
  const filteredHistory = history
    .filter((item) => {
      let statusMatch = true;
      if (filterStatus === "Đang tiến hành") {
        statusMatch = [
          "Đã đặt lịch",
          "Đang đổi pin",
          "Đang chờ tìm pin",
        ].includes(item.status);
      } else if (filterStatus === "Đã kết thúc") {
        if (sortStatus === "Tất cả") {
          statusMatch = ["Đã hoàn thành", "Hủy đặt lịch", "Quá hạn"].includes(
            item.status
          );
        } else {
          statusMatch = item.status === sortStatus;
        }
      }

      let fromMatch = true;
      let toMatch = true;
      if (item.scheduleTime) {
        const itemDate = new Date(item.scheduleTime);
        if (!isNaN(itemDate.getTime())) {
          const itemDay = itemDate.toISOString().split("T")[0];
          if (filterFrom) fromMatch = itemDay >= filterFrom;
          if (filterTo) toMatch = itemDay <= filterTo;
        }
      }

      return statusMatch && fromMatch && toMatch;
    })
    .sort(
      (a, b) =>
        new Date(b.scheduleTime).getTime() - new Date(a.scheduleTime).getTime()
    );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const displayedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancelBooking = async (id: string) => {
    if (!confirm(`Bạn có chắc muốn hủy đặt lịch ${id} không?`)) return;

    try {
      await api.delete(`/bookings/${id}`, { withCredentials: true });
      toast.success("Hủy đặt lịch thành công!");
      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "Hủy đặt lịch" } : item
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error("Lỗi hủy đặt lịch:", err);
      toast.error("Không thể hủy đặt lịch!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] p-6 text-gray-800">
      <h1 className="text-5xl font-extrabold mb-6 text-center text-[#38A3A5] drop-shadow-sm">
        Lịch sử đặt lịch
      </h1>

      {/* Filter */}
      <div className="flex justify-center mb-4">
        <div className="relative flex justify-center gap-4 mb-4 flex-wrap bg-[#C7F9CC] rounded-full p-2 w-[320px] shadow-md">
          {["Đang tiến hành", "Đã kết thúc"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status as any);
                setSortStatus("Tất cả");
                setCurrentPage(1);
              }}
              className={`relative z-10 flex-1 text-center py-2 text-sm font-medium transition-colors duration-200 rounded-full ${
                filterStatus === status
                  ? "text-white"
                  : "text-[#2D6A4F] hover:text-[#1B4332]"
              }`}
            >
              {status}
              {filterStatus === status && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-gradient-to-r from-[#57CC99] to-[#38A3A5] rounded-full z-[-1]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6 items-center text-[#2D6A4F]">
        <span className="font-semibold">Từ</span>
        <Input
          type="date"
          value={filterFrom}
          onChange={(e) => {
            setFilterFrom(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-[150px]"
        />
        <span>đến</span>
        <Input
          type="date"
          value={filterTo}
          onChange={(e) => {
            setFilterTo(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-[150px]"
        />
      </div>

      {filterStatus === "Đã kết thúc" && (
        <div className="flex justify-center gap-2 mb-6">
          {["Tất cả", "Đã hoàn thành", "Hủy đặt lịch", "Quá hạn"].map(
            (status) => (
              <Button
                key={status}
                size="sm"
                variant={sortStatus === status ? "default" : "outline"}
                className={
                  sortStatus === status
                    ? "bg-gradient-to-r from-[#57CC99] to-[#38A3A5] text-white border-0"
                    : "border-[#57CC99] text-[#38A3A5]"
                }
                onClick={() => {
                  setSortStatus(status as any);
                  setCurrentPage(1);
                }}
              >
                {status}
              </Button>
            )
          )}
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-3 items-center">
        {displayedHistory.map((item) => (
          <Card
            key={item.id}
            className="relative p-5 w-full md:w-1/2 bg-white/80 border border-[#C7F9CC] shadow-sm rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <div
              className={`absolute top-3 right-4 font-medium ${
                item.status === "Đã đặt lịch"
                  ? "text-[#2D6A4F]"
                  : item.status === "Đang đổi pin"
                  ? "text-blue-600"
                  : item.status === "Đang chờ tìm pin"
                  ? "text-teal-600"
                  : item.status === "Đã hoàn thành"
                  ? "text-green-600"
                  : item.status === "Hủy đặt lịch"
                  ? "text-orange-500"
                  : "text-red-600"
              }`}
            >
              {item.status}
            </div>

            <div className="text-[#2D6A4F]">
              <div className="font-semibold">Tên Xe: {item.vehicleName}</div>
              <div>Biển số: {item.licensePlates}</div>
              <div>Tên trạm: {item.station}</div>
              <div>
                Thời gian đặt lịch:{" "}
                {item.scheduleTime
                  ? item.scheduleTime.replace("T", " ").replace(".000Z", "")
                  : "Chưa có"}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#57CC99] to-[#38A3A5] text-white rounded-xl hover:opacity-90"
                onClick={() => {
                  setSelectedBooking(item);
                  setIsModalOpen(true);
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            size="sm"
            variant={currentPage === i + 1 ? "default" : "outline"}
            className={
              currentPage === i + 1
                ? "bg-gradient-to-r from-[#57CC99] to-[#38A3A5] text-white border-0"
                : "border-[#57CC99] text-[#38A3A5]"
            }
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#38A3A5] font-bold">
              Chi tiết đặt lịch
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết của lịch đã chọn
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="space-y-2 mt-2 text-[#2D6A4F]">
              <p>
                <strong>Mã đặt lịch:</strong> {selectedBooking.id}
              </p>
              <p>
                <strong>Tên người đặt:</strong> {selectedBooking.customerName}
              </p>
              <p>
                <strong>Tên xe:</strong> {selectedBooking.vehicleName}
              </p>
              <p>
                <strong>Biển số:</strong> {selectedBooking.licensePlates}
              </p>
              <p>
                <strong>Loại pin:</strong> {selectedBooking.batteryType}
              </p>
              <p>
                <strong>Tên trạm:</strong> {selectedBooking.station}
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {selectedBooking.scheduleTime
                  ? new Date(selectedBooking.scheduleTime).toLocaleString(
                      "vi-VN"
                    )
                  : "Chưa có"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={
                    selectedBooking.status === "Đã đặt lịch"
                      ? "text-[#2D6A4F]"
                      : selectedBooking.status === "Đang đổi pin"
                      ? "text-blue-600"
                      : selectedBooking.status === "Đang chờ tìm pin"
                      ? "text-teal-600"
                      : selectedBooking.status === "Đã hoàn thành"
                      ? "text-green-600"
                      : selectedBooking.status === "Hủy đặt lịch"
                      ? "text-orange-500"
                      : "text-red-600"
                  }
                >
                  {selectedBooking.status}
                </span>
              </p>
              {selectedBooking.note && (
                <p>
                  <strong>Ghi chú:</strong> {selectedBooking.note}
                </p>
              )}
            </div>
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}

          {selectedBooking?.status === "Đã đặt lịch" && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => handleCancelBooking(selectedBooking.id)}
              >
                Hủy đặt lịch
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
