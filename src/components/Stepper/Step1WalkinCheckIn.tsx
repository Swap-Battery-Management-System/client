// src/pages/WalkinSwap.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Interfaces
interface Vehicle {
  id: string;
  licensePlates: string;
  VIN: string;
  model: { id: string; name: string };
  batteryTypeId: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  vehicles: Vehicle[];
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
  status: "available" | "unavailable";
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
  const [emailInput, setEmailInput] = useState("");
  const [licenseInput, setLicenseInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [batteryStatus, setBatteryStatus] = useState<
    "checking" | "ok" | "none" | null
  >(null);

  // Mock data
  //TODO: 
  const mockUser: User = {
    id: "u123",
    fullName: "Nguyễn Văn A",
    email: "a.nguyen@example.com",
    phoneNumber: "0123456789",
    address: "123 Đường ABC, Q1, TP.HCM",
    vehicles: [
      {
        id: "v001",
        licensePlates: "59A-123.45",
        VIN: "VIN123456",
        model: { id: "m001", name: "VinFast Klara" },
        batteryTypeId: "bt001",
      },
    ],
  };

  const mockStation: Station = { id: "s001", name: "Trạm 1" };

  const mockBatteries: Battery[] = [
    {
      id: "b001",
      code: "BAT123",
      currentCapacity: 1200,
      cycleCount: 5,
      soc: 90,
      batteryTypeId: "bt001",
      status: "available",
    },
    {
      id: "b002",
      code: "BAT124",
      currentCapacity: 1000,
      cycleCount: 10,
      soc: 50,
      batteryTypeId: "bt002",
      status: "available",
    },
  ];

  // Step 1: tìm user
  const handleSearchUser = () => {
    if (!emailInput.trim()) return;
    if (emailInput.toLowerCase() === "a.nguyen@example.com") {
      setUser(mockUser);
      setStation(mockStation);
      setStep(2);
      toast.success("Tìm thấy user. Tiếp tục nhập biển số xe.");
    } else {
      toast.error("Không tìm thấy người dùng!");
      setUser(null);
    }
  };

  // Step 2: xác thực xe & pin
  const handleCheckVehicle = () => {
    if (!licenseInput.trim() || !user) return;

    const foundVehicle = user.vehicles.find(
      (v) => v.licensePlates === licenseInput.trim()
    );
    if (!foundVehicle) {
      toast.error("Xe không thuộc quyền sở hữu của user!");
      setVehicle(null);
      setBatteryStatus(null);
      return;
    }

    setVehicle(foundVehicle);

    // Kiểm tra pin phù hợp
    const compatibleBattery = mockBatteries.find(
      (b) =>
        b.batteryTypeId === foundVehicle.batteryTypeId &&
        b.status === "available"
    );

    if (compatibleBattery) {
      setBatteryStatus("ok");
      onUpdate("newBattery", compatibleBattery);
      toast.success("Có pin phù hợp tại trạm ✅");
    } else {
      setBatteryStatus("none");
      toast.error("Không có pin phù hợp ❌");
    }

    // Cập nhật thông tin
    onUpdate("user", user);
    onUpdate("vehicle", foundVehicle);
    onUpdate("station", mockStation);
  };

  // Tạo swap session
  const handleNext = () => {
    if (!user || !vehicle || !station || batteryStatus !== "ok") {
      toast.error("Vui lòng hoàn tất check-in trước khi tiếp tục!");
      return;
    }

    const swapSession = {
      id: "swap001",
      userId: user.id,
      vehicleId: vehicle.id,
      stationId: station.id,
      isWalkin: true,
    };
    onUpdate("swapSession", swapSession);
    toast.success("Swap session đã được tạo!");
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl p-6 shadow-md mx-auto">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Check-in Walk-in</h2>

        {step === 1 && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập email của khách hàng"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <Button onClick={handleSearchUser}>Tìm user</Button>
          </div>
        )}

        {step === 2 && user && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập biển số xe"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <Button onClick={handleCheckVehicle}>Kiểm tra xe & pin</Button>
            </div>

            {vehicle && (
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Khách hàng:</strong> {user.fullName} | {user.email}
                </p>
                <p>
                  <strong>Xe:</strong> {vehicle.model.name} |{" "}
                  {vehicle.licensePlates}
                </p>
                <p>
                  <strong>Trạng thái pin:</strong>{" "}
                  {batteryStatus === "ok"
                    ? "Có pin phù hợp tại trạm ✅"
                    : batteryStatus === "none"
                    ? "Không có pin phù hợp ❌"
                    : "Đang kiểm tra..."}
                </p>
                <p>
                  <strong>Trạm:</strong> {station?.name}
                </p>

                {batteryStatus === "ok" && (
                  <Button onClick={handleNext} className="w-full mt-4">
                    Tạo Swap Session & Tiếp tục
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
