// src/pages/WalkinSwap.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Vehicle {
  id: string;
  licensePlates: string;
  VIN: string;
  model: { id: string; name: string; batteryTypeId: string };
  batteryTypeId: string;
  status?: string; // thêm status

}

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  vehicles?: Vehicle[];
}

interface Station {
  id: string;
  name: string;
}

interface Battery {
  id: string;
  code: string;
  currentCapacity: number;
  cycleCount: number;
  soc: number;
  batteryTypeId: string;
  status: string;
}

interface Step1WalkinCheckInProps {
  onNext: () => void;
  onUpdate: (key: string, value: any) => void;
}

export default function WalkinSwap({
  onNext,
  onUpdate,
}: Step1WalkinCheckInProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchInput, setSearchInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [batteryStatus, setBatteryStatus] = useState<
    "checking" | "ok" | "none" | null
  >(null);

  // Load stations khi mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get("/stations", { withCredentials: true });
        const data = res.data?.data?.stations;

        const list: Station[] = Array.isArray(data) ? data : data ? [data] : [];
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
      const foundUser: User = Array.isArray(data) ? data[0] : data;
      console.log("foundUser", res.data);
      if (foundUser) {
        // Chỉ lấy xe active
       
        const activeVehicles = (foundUser.vehicles ?? []).filter(
          (v) => v.status === "active"
        );
        setUser(foundUser);
        setVehicles(activeVehicles);

        // Nếu chỉ có 1 xe, auto chọn
        if (activeVehicles.length === 1) {
          setSelectedVehicleId(activeVehicles[0].id);
        }

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

  // Step 2: Kiểm tra xe & pin
  const handleCheckVehicle = async () => {
    if (!user || !selectedVehicleId) return toast.error("Vui lòng chọn xe!");
    if (!selectedStationId) return toast.error("Vui lòng chọn trạm!");

    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (!vehicle) return toast.error("Xe không hợp lệ!");

    try {
      const res = await api.get(`/batteries/station/${selectedStationId}`, {
        withCredentials: true,
      });
      console.log("battery",res);
      const batteries: Battery[] = res.data?.data?.batteries ?? [];

      const compatible = batteries.some(
        (b) =>
          b.batteryTypeId === vehicle.model.batteryTypeId && b.status === "available"
      );

      if (compatible) {
        setBatteryStatus("ok");
        toast.success("Có pin phù hợp tại trạm ✅");
      } else {
        setBatteryStatus("none");
        toast.error("Không có pin phù hợp ❌");
      }

      onUpdate("vehicle", vehicle);
      const station = stations.find((s) => s.id === selectedStationId);
      onUpdate("station", station);
    } catch (err) {
      console.error("Lỗi khi kiểm tra pin:", err);
      setBatteryStatus("none");
      toast.error("Không thể kiểm tra pin!");
    }
  };

  // Step 3: Tạo swap session
  const handleNext = () => {
    if (!user || !selectedVehicleId || batteryStatus !== "ok") {
      return toast.error("Vui lòng hoàn tất check-in trước khi tiếp tục!");
    }
    const swapSession = {
      id: "swap001",
      userId: user.id,
      vehicleId: selectedVehicleId,
      stationId: selectedStationId,
      isWalkin: true,
    };
    onUpdate("swapSession", swapSession);
    toast.success("Swap session đã được tạo!");
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl p-6 shadow-md mx-auto">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-[#38A3A5]">
          Check-in Walk-in
        </h2>

        {/* Step 1: Tìm user */}
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

        {/* Step 2: Hiển thị thông tin user và chọn xe */}
        {step === 2 && user && (
          <>
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
              <p>
                <strong>Địa chỉ:</strong> {user.address}
              </p>
            </div>

            <div className="flex gap-2 mt-3">
              <select
                className="flex-1 border p-2 rounded"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">-- Chọn xe của khách hàng --</option>
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model.name} | {v.licensePlates}
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
                className="w-full mt-4 bg-[#38A3A5] hover:bg-[#2D8688] text-white"
                onClick={handleNext}
              >
                Tạo Swap Session & Tiếp tục
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
