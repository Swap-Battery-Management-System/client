// src/pages/WalkinSwap.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function WalkinSwap({
  onNext,
  onUpdate,
  onCheckinSuccess,
}: any) {
  const [step, setStep] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [batteryStatus, setBatteryStatus] = useState<any>(null);
  const [batteryTypeName, setBatteryTypeName] = useState<string>("");
  const [currentBattery, setCurrentBattery] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = vehicles.find((v: any) => v.id === selectedVehicleId);

  // Lấy danh sách trạm
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get("/stations", { withCredentials: true });
        const data = res.data?.data?.stations;
        const list = Array.isArray(data) ? data : data ? [data] : [];
        setStations(list);
        if (list.length === 1) setSelectedStationId(list[0].id);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách trạm:", err);
        toast.error("Không thể tải danh sách trạm!");
      }
    };
    fetchStations();
  }, []);

  // Step 1: Tìm user
  const handleSearchUser = async () => {
    const keyword = searchInput.trim();
    if (!keyword) return toast.error("Vui lòng nhập thông tin tìm kiếm!");

    try {
      const res = await api.get("/users/search", {
        params: { keyword },
        withCredentials: true,
      });

      const data = res.data?.data?.users;
      const foundUser = Array.isArray(data) ? data[0] : data;

      if (foundUser) {
        const activeVehicles = (foundUser.vehicles ?? []).filter(
          (v: any) => v.status === "active"
        );
        setUser(foundUser);
        setVehicles(activeVehicles);
        if (activeVehicles.length === 1)
          setSelectedVehicleId(activeVehicles[0].id);
        setStep(2);
        toast.success("Tìm thấy người dùng ✅");
        onUpdate("user", foundUser);
      } else {
        setUser(null);
        setVehicles([]);
        toast.error("Không tìm thấy người dùng!");
      }
    } catch (err) {
      console.error("Lỗi tìm user:", err);
      toast.error("Có lỗi xảy ra khi tìm người dùng!");
    }
  };

  // Khi chọn xe → lấy loại pin & pin hiện tại
  useEffect(() => {
    const fetchBatteryInfo = async () => {
      if (!selectedVehicle) {
        setBatteryTypeName("");
        setCurrentBattery(null);
        return;
      }

      try {
        // 1 Lấy tên loại pin
        const resType = await api.get(
          `/battery-types/${selectedVehicle.model.batteryTypeId}`,
          { withCredentials: true }
        );
        setBatteryTypeName(resType.data?.data?.batteryType.name || "Không xác định");
        // 2️ Nếu xe đang gắn pin, lấy thông tin pin
        if (selectedVehicle.batteryId) {
          const resBattery = await api.get(
            `/batteries/${selectedVehicle.batteryId}`,
            { withCredentials: true }
          );
          setCurrentBattery(resBattery.data?.data || null);
        } else {
          setCurrentBattery(null);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin pin:", err);
        setBatteryTypeName("Không xác định");
      }
    };

    fetchBatteryInfo();
  }, [selectedVehicleId]);

  // Step 2: Kiểm tra pin tại trạm
  const handleCheckVehicle = async () => {
    if (!user || !selectedVehicleId) return toast.error("Vui lòng chọn xe!");
    if (!selectedStationId) return toast.error("Vui lòng chọn trạm!");

    const vehicle = selectedVehicle;
    if (!vehicle) return toast.error("Xe không hợp lệ!");

    try {
      const res = await api.get(`/batteries/station/${selectedStationId}`, {
        withCredentials: true,
      });
      const batteries = res.data?.data?.batteries ?? [];

      const compatible = batteries.some(
        (b: any) =>
          b.batteryTypeId === vehicle.model.batteryTypeId &&
          b.status === "available"
      );

      if (compatible) {
        setBatteryStatus("ok");
        toast.success("Có pin phù hợp tại trạm ✅");
      } else {
        setBatteryStatus("none");
        toast.error("Không có pin phù hợp ❌");
      }

      onUpdate("vehicle", vehicle);
      const station = stations.find((s: any) => s.id === selectedStationId);
      onUpdate("station", station);
    } catch (err) {
      console.error("Lỗi khi kiểm tra pin:", err);
      setBatteryStatus("none");
      toast.error("Không thể kiểm tra pin!");
    }
  };

  // Step 3: Check-in
  const handleCheckin = async () => {
    const vehicle = selectedVehicle;
    const station = stations.find((s: any) => s.id === selectedStationId);
    if (!user || !vehicle || !station)
      return toast.error("Thiếu thông tin cần thiết!");

    try {
      setSubmitting(true);
      const res = await api.post(
        `/stations/${station.id}/checkin`,
        { userId: user.id, isWalkin: true, vehicleId: vehicle.id },
        { withCredentials: true }
      );

      const swapSession = res.data?.data?.swapSession;
      if (swapSession?.id) {
        onUpdate("swapSession", swapSession);
        toast.success("Check-in thành công!");
        onCheckinSuccess ? onCheckinSuccess(swapSession) : onNext();
      } else {
        toast.error("Không lấy được swapSession.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Check-in thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6 shadow-md mx-auto">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-[#38A3A5]">
          Check-in Walk-in
        </h2>

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập email / username / số điện thoại"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <Button
              className="bg-[#38A3A5] hover:bg-[#2D8688] text-white"
              onClick={handleSearchUser}
            >
              Tìm user
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && user && (
          <>
            {/* Thông tin user */}
            <div className="bg-gray-50 p-4 rounded space-y-2 border border-[#38A3A5]/20">
              <p>
                <strong>Họ tên:</strong> {user.fullName}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {user.phoneNumber}
              </p>
            </div>

            {/* Chọn xe */}
            <div className="flex gap-2 mt-3">
              <select
                className="flex-1 border p-2 rounded"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">-- Chọn xe của khách hàng --</option>
                {vehicles.length > 0 ? (
                  vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.model?.name} | {v.licensePlates}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Không có xe active
                  </option>
                )}
              </select>
              <Button
                className="bg-[#38A3A5] hover:bg-[#2D8688] text-white"
                onClick={handleCheckVehicle}
              >
                Kiểm tra pin
              </Button>
            </div>

            {/* Thông tin xe chi tiết */}
            {selectedVehicle && (
              <div className="bg-gray-100 mt-4 p-4 rounded border text-sm space-y-1">
                <p>
                  <strong>Tên xe:</strong> {selectedVehicle.model?.name}
                </p>
                <p>
                  <strong>Biển số:</strong> {selectedVehicle.licensePlates}
                </p>
                <p>
                  <strong>VIN:</strong> {selectedVehicle.VIN}
                </p>
                <p>
                  <strong>Loại pin:</strong> {batteryTypeName}
                </p>
                <p>
                  <strong>Trạng thái xe:</strong> {selectedVehicle.status}
                </p>

                {currentBattery ? (
                  <>
                    <p>
                      <strong>Mã pin:</strong> {currentBattery.code}
                    </p>
                    <p>
                      <strong>Dung lượng:</strong>{" "}
                      {currentBattery.currentCapacity} kWh
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-600">
                    Xe chưa từng đổi pin trước đây
                  </p>
                )}
              </div>
            )}

            {batteryStatus && (
              <p
                className={`mt-3 font-semibold ${
                  batteryStatus === "ok" ? "text-green-600" : "text-red-600"
                }`}
              >
                {batteryStatus === "ok"
                  ? "Có pin phù hợp tại trạm ✅"
                  : "Không có pin phù hợp ❌"}
              </p>
            )}

            {batteryStatus === "ok" && (
              <Button
                disabled={submitting}
                className="w-full mt-4 bg-[#38A3A5] hover:bg-[#2D8688] text-white"
                onClick={handleCheckin}
              >
                {submitting ? "Đang xử lý..." : "Tạo Swap Session & Tiếp tục"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
