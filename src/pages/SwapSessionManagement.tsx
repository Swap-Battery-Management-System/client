// src/pages/SwapSessionManager.tsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SwapSession {
  id: string;
  type: string;
  status: string;
  stationId: string;
  userId: string;
  vehicleId: string;
  bookingId: string;
  oldBatteryId: string | null;
  newBatteryId: string | null;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string | null;
  user?: any;
  batteryOld?: any;
  batteryNew?: any;
  station?: any;
  vehicle?: any;
  invoice?: any;
}

export default function SwapSessionManager() {
  const [sessions, setSessions] = useState<SwapSession[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<SwapSession | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/swap-sessions/", { withCredentials: true });
        const data = res.data.data;
        const enrichedSessions = await Promise.all(
          data.map(async (s: SwapSession) => {
            const [userRes, stationRes, vehicleRes] = await Promise.all([
              api.get(`/users/${s.userId}`, { withCredentials: true }),
              api.get(`/stations/${s.stationId}`, { withCredentials: true }),
              api.get(`/vehicles/${s.vehicleId}`, { withCredentials: true }),
            ]);

            // Pin cũ
            let batteryOld = null;
            if (s.oldBatteryId) {
              const oldRes = await api.get(`/batteries/${s.oldBatteryId}`, {
                withCredentials: true,
              });
              const oldBattery = oldRes.data.data.battery;
              const oldType = oldBattery.batteryTypeId
                ? (
                    await api.get(
                      `/battery-types/${oldBattery.batteryTypeId}`,
                      {
                        withCredentials: true,
                      }
                    )
                  ).data.data.batteryType.name
                : null;
              batteryOld = { ...oldBattery, typeName: oldType };
            }

            // Pin mới
            let batteryNew = null;
            if (s.newBatteryId) {
              const newRes = await api.get(`/batteries/${s.newBatteryId}`, {
                withCredentials: true,
              });
              const newBattery = newRes.data.data.battery;
              const newType = newBattery.batteryTypeId
                ? (
                    await api.get(
                      `/battery-types/${newBattery.batteryTypeId}`,
                      {
                        withCredentials: true,
                      }
                    )
                  ).data.data.batteryType.name
                : null;
              batteryNew = { ...newBattery, typeName: newType };
            }

            // Hóa đơn
            let invoice = null;
            if (s.invoice) {
              try {
                const invoiceRes = await api.get(`/invoices/${s.invoice.id}`, {
                  withCredentials: true,
                });
                invoice = invoiceRes.data.data.invoice;
              } catch {
                invoice = null;
              }
            }

            return {
              ...s,
              user: userRes.data.data.user,
              station: stationRes.data.data.station,
              vehicle: vehicleRes.data.data.vehicle,
              batteryOld,
              batteryNew,
              invoice,
            };
          })
        );

        // Sort theo updatedAt mới nhất (nếu null dùng createdAt)
        enrichedSessions.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });

        setSessions(enrichedSessions);
      } catch (err) {
        console.error("Không thể tải swap sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(
    (s) =>
      s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = (sessionId: string) => {
    navigate(`/staff/battery-process/swap/${sessionId}`);
  };

 const formatDateTime = (iso: string) => {
   const [date, time] = iso.split("T");
   const timePart = time.split(".")[0]; // loại bỏ phần milliseconds
   return `${date} ${timePart}`;
 };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38A3A5] mb-4">
        Quản lý Swap Session
      </h1>

      <Input
        placeholder="Tìm kiếm theo email hoặc ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-md"
      />

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-[#38A3A5] w-8 h-8 mr-2" />
          <span className="text-[#38A3A5] font-medium">
            Đang tải dữ liệu...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#E6F7F7] text-[#38A3A5]">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Trạm</th>
                <th className="px-4 py-2 text-left">Xe</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Ngày cập nhật</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSessions.map((s) => (
                <tr key={s.id} className="bg-white hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium text-gray-700">
                    {s.id.split("-")[0]}
                  </td>
                  <td className="px-4 py-2">{s.user?.email}</td>
                  <td className="px-4 py-2">{s.station?.name}</td>
                  <td className="px-4 py-2">{s.vehicle?.name || "-"}</td>
                  <td className="px-4 py-2">{s.type}</td>
                  <td className="px-4 py-2">
                    {formatDateTime(s.updatedAt || s.createdAt)}
                  </td>
                  <td className="px-4 py-2">{s.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {s.status.startsWith("in-progress") && (
                      <Button
                        size="sm"
                        className="bg-[#38A3A5] text-white hover:bg-[#2f8c8c]"
                        onClick={() => handleContinue(s.id)}
                      >
                        Tiếp tục
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-[#38A3A5] text-[#38A3A5] hover:bg-[#E6F7F7]"
                      onClick={() => setSelectedSession(s)}
                    >
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[420px] max-h-[85vh] overflow-auto shadow-lg">
            <h2 className="text-xl font-bold text-[#38A3A5] mb-4">
              Chi tiết Swap Session
            </h2>

            <p>
              <strong>Email user:</strong> {selectedSession.user?.email}
            </p>
            <p>
              <strong>Tên user:</strong> {selectedSession.user?.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {selectedSession.user?.phoneNumber}
            </p>

            <div className="mt-3 border-t pt-2">
              <p>
                <strong>Trạm:</strong> {selectedSession.station?.name}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {selectedSession.station?.address}
              </p>
            </div>

            <div className="mt-3 border-t pt-2">
              <p>
                <strong>Xe:</strong> {selectedSession.vehicle?.name || "-"}
              </p>
              <p>
                <strong>Biển số:</strong>{" "}
                {selectedSession.vehicle?.licensePlates || "-"}
              </p>
              <p>
                <strong>Loại xe:</strong>{" "}
                {selectedSession.vehicle?.model?.name || "-"}
              </p>
            </div>

            <p className="mt-3">
              <strong>Type:</strong> {selectedSession.type}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {formatDateTime(selectedSession.createdAt)}
            </p>
            <p>
              <strong>Ngày cập nhật:</strong>{" "}
              {formatDateTime(
                selectedSession.updatedAt || selectedSession.createdAt
              )}
            </p>

            {selectedSession.batteryOld && (
              <div className="mt-3 border-t pt-2">
                <h4 className="font-semibold text-[#38A3A5]">🔋 Pin cũ</h4>
                <p>
                  <strong>Mã pin:</strong> {selectedSession.batteryOld.code}
                </p>
                <p>
                  <strong>Loại pin:</strong>{" "}
                  {selectedSession.batteryOld.typeName || "-"}
                </p>
                <p>
                  <strong>Dung lượng:</strong>{" "}
                  {selectedSession.batteryOld.currentCapacity} Wh
                </p>
              </div>
            )}

            {selectedSession.batteryNew && (
              <div className="mt-3 border-t pt-2">
                <h4 className="font-semibold text-[#38A3A5]">⚡ Pin mới</h4>
                <p>
                  <strong>Mã pin:</strong> {selectedSession.batteryNew.code}
                </p>
                <p>
                  <strong>Loại pin:</strong>{" "}
                  {selectedSession.batteryNew.typeName || "-"}
                </p>
                <p>
                  <strong>Dung lượng:</strong>{" "}
                  {selectedSession.batteryNew.currentCapacity} Wh
                </p>
              </div>
            )}

            {selectedSession.invoice && (
              <div className="mt-3 border-t pt-2">
                <h4 className="font-semibold text-[#38A3A5]">🧾 Hóa đơn</h4>
                <p>
                  <strong>ID hóa đơn:</strong> {selectedSession.invoice.id}
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {selectedSession.invoice.amountTotal}₫
                </p>
                <p>
                  <strong>Trạng thái:</strong> {selectedSession.invoice.status}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {formatDateTime(selectedSession.invoice.createdAt)}
                </p>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <Button
                className="bg-[#38A3A5] text-white"
                onClick={() => setSelectedSession(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
