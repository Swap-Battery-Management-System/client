import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

export function Step2CheckPin({ onNext, onPrev, data }: any) {
  const [batteryCode, setBatteryCode] = useState(data?.oldBatteryCode || "");
  const [loading, setLoading] = useState(false);
  const [battery, setBattery] = useState<any>(null);
  const [internalDamage, setInternalDamage] = useState<any[]>([]);
  const [externalDamageList, setExternalDamageList] = useState<any[]>([]);
  const [selectedExternal, setSelectedExternal] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptCount = useRef(0);
  const vehicle = data?.vehicle || {};

  // Lấy danh sách external damage khi component mount
  useEffect(() => {
    const fetchExternalDamage = async () => {
      try {
        const res = await api.get(`/damage-fees`, { withCredentials: true });
        const external =
          res.data.data?.filter((d: any) => d.type === "external_force") || [];
        setExternalDamageList(external);
      } catch (err) {
        console.error("Không lấy được danh sách hư hại external:", err);
      }
    };
    fetchExternalDamage();
  }, []);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
  };

  const fetchBattery = async () => {
    if (!batteryCode.trim()) return;
    if (!data?.swapSessionId) {
      toast.error("Thiếu thông tin phiên đổi pin (swapSessionId)!");
      stopPolling();
      return;
    }

    try {
      const res = await api.post(
        `/swap-sessions/${data.swapSessionId}/check-battery`,
        { batteryCode },
        { withCredentials: true }
      );

      const responseData = res.data.data;
      if (responseData?.batteryData) {
        setBattery(responseData.batteryData);
        setInternalDamage(responseData.damageFees);
        toast.success(`Pin ${responseData.batteryData.code} đã có dữ liệu!`);
        stopPolling();
      } else {
        attemptCount.current += 1;
        if (attemptCount.current >= 6) {
          toast.warning("Không có dữ liệu, vui lòng thử lại.");
          stopPolling();
        }
      }
    } catch (err: any) {
      console.error("Lỗi check pin:", err);
      attemptCount.current += 1;
      if (attemptCount.current >= 6) {
        toast.error("Lỗi khi kiểm tra pin. Vui lòng thử lại.");
        stopPolling();
      }
    }
  };

  const startPolling = () => {
    if (!batteryCode.trim()) return toast.error("Nhập mã pin cần kiểm tra!");
    if (intervalRef.current) return toast.info("Đang kiểm tra pin...");
    if (!data?.swapSessionId)
      return toast.error("Thiếu thông tin phiên đổi pin (swapSessionId)!");

    attemptCount.current = 0;
    setLoading(true);
    fetchBattery();
    intervalRef.current = setInterval(fetchBattery, 10000);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleExternalChange = (id: string) => {
    setSelectedExternal((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (!battery) return toast.error("Chưa có dữ liệu pin!");
    onNext({
      batteryId: battery.id,
      selectedExternalDamageFees: selectedExternal,
    });
  };

  return (
    <div className="flex justify-center w-full py-12 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg border border-[#38A3A5]/20 bg-white rounded-2xl">
        <CardContent className="p-10 space-y-6">
          <h2 className="text-2xl font-bold text-center text-[#38A3A5]">
            Kiểm tra thông số pin
          </h2>

          {/* Hiển thị thông tin xe người dùng */}
          {vehicle && (
            <div className="bg-[#F8FCFC] p-4 rounded-xl border border-[#38A3A5]/20 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2D8688] mb-2">
                Thông tin xe người dùng
              </h3>
              <p>Tên xe: {vehicle.name || "Không có dữ liệu"}</p>
              <p>Loại xe: {vehicle.model.name || "Không có dữ liệu"}</p>
              <p>Biển số: {vehicle.licensePlates || "Không có dữ liệu"}</p>
              {vehicle.image && (
                <img
                  src={vehicle.image}
                  alt="Vehicle"
                  className="mt-3 rounded-lg border w-48"
                />
              )}
            </div>
          )}

          {/* Nếu chưa có mã pin thì cho nhập thủ công */}
          <div className="space-y-4">
            {batteryCode ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-700 font-medium">
                  Mã pin: {batteryCode}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label
                  htmlFor="batteryId"
                  className="text-gray-700 font-medium"
                >
                  Người dùng chưa từng đổi pin trước đây. Vui lòng nhập mã pin
                  để kiểm tra:
                </Label>
                <Input
                  id="batteryId"
                  placeholder="VD: LION041"
                  value={batteryCode}
                  onChange={(e) => setBatteryCode(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex justify-center mt-4 gap-3">
              <Button
                onClick={startPolling}
                className="bg-[#38A3A5] text-white px-6 py-2 rounded-xl flex items-center gap-2"
                disabled={!batteryCode.trim() || loading}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span className="ml-2">
                  {loading ? "Đang kiểm tra pin..." : "Kiểm tra pin"}
                </span>
              </Button>

              {loading && (
                <Button
                  onClick={() => {
                    stopPolling();
                    toast.info("Đã dừng kiểm tra pin.");
                  }}
                  className="bg-red-500 text-white px-6 py-2 rounded-xl"
                >
                  Dừng kiểm tra
                </Button>
              )}
            </div>
          </div>

          {/* Kết quả pin */}
          {battery && (
            <div className="mt-6 bg-[#F8FCFC] p-6 rounded-xl border border-[#38A3A5]/20 shadow-sm">
              <h3 className="text-lg font-semibold text-[#38A3A5] mb-4 text-center">
                Kết quả pin
              </h3>
              <p>Mã pin: {battery.code}</p>
              <p>Loại pin: {battery.batteryType}</p>
              <p>Dung lượng: {battery.currentCapacity} Wh</p>
              <p>Cycle count: {battery.cycleCount}</p>
              <p>Voltage: {battery.voltage}</p>
              <p>Nhiệt độ: {battery.temperature} °C</p>
              <p>Ngày sản xuất: {battery.manufacturedAt.split("T")[0]}</p>

              {internalDamage.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-[#2D8688]">
                    Hư hại nội bộ (internal)
                  </h4>
                  {internalDamage.map((d: any) => (
                    <div
                      key={d.id}
                      className="flex justify-between py-1 border-b"
                    >
                      <span>
                        {d.name} ({d.severity})
                      </span>
                      <span>
                        {d.amount} {d.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {externalDamageList.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-[#2D8688]">
                    Hư hại vật lý (external)
                  </h4>
                  {externalDamageList.map((d: any) => (
                    <label key={d.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedExternal.includes(d.id)}
                        onChange={() => handleExternalChange(d.id)}
                      />
                      <span>
                        {d.name} ({d.severity})
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleConfirm}
                  className="bg-[#38A3A5] text-white px-10 py-3 rounded-xl"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
