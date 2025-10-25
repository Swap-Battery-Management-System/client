"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Kiểu dữ liệu Pin
interface Battery {
  id: string;
  code: string;
  currentCapacity: number | string;
  cycleCount: number | string;
  manufacturedAt: string;
  soc: number | string;
  status: "available" | "in_charged" | "reserved" | "in_use" | "faulty";
  stationId?: string;
  batteryType?: {
    id: string;
    name: string;
    designCapacity?: string;
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
    </div>
  );
}
