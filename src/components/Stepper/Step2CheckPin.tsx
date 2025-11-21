import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { ConfirmModal } from "../ConfirmModal";

export function Step2CheckPin({
  onNext,
  onPrev,
  data,
  onCancelProcess,
  onUpdate,
}: any) {
  const [batteryCode, setBatteryCode] = useState(data?.oldBattery?.code || "");
  const [hasOldBattery, setHasOldBattery] = useState(!!data?.oldBattery);
  const batteryType = data?.batteryType;
  const [loading, setLoading] = useState(false);
  const [battery, setBattery] = useState<any>(null);
  const [internalDamage, setInternalDamage] = useState<any[]>([]);
  const [externalDamageList, setExternalDamageList] = useState<any[]>([]);
  const [filteredExternalDamage, setFilteredExternalDamage] = useState<any[]>(
    []
  );
  const [selectedExternal, setSelectedExternal] = useState<string[]>([]);

  const vehicle = data?.vehicle || {};
  const swapSession = data?.swapSession || {};
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Lấy danh sách hư hại external
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

  // Lọc external theo loại pin
  useEffect(() => {
    if (!battery) return;

    const variantMap: Record<string, string> = {
      LiIon: "LIB",
      LiFePO4: "LFP",
    };

    const currentVariant = variantMap[battery.batteryType] || null;
    const filtered =
      externalDamageList.filter(
        (d) => !currentVariant || d.variant === currentVariant
      ) || [];

    setFilteredExternalDamage(filtered);
  }, [battery, externalDamageList]);

  // Check pin
  const checkBattery = async () => {
    if (!batteryCode.trim()) return toast.error("Nhập mã pin cần kiểm tra!");

    if (!swapSession?.id)
      return toast.error("Thiếu thông tin phiên đổi pin (swapSessionId)!");

    setLoading(true);

    try {
      const res = await api.post(
        `/swap-sessions/${swapSession.id}/check-battery`,
        { batteryCode },
        { withCredentials: true }
      );

      const responseData = res.data.data;

      if (responseData?.batteryData) {
        setBattery(responseData.batteryData);
        setInternalDamage(responseData.damageFees || []);
        toast.success(`Pin ${batteryCode} đã có dữ liệu!`);
      } else {
        toast.warning("Không có dữ liệu pin.");
      }
    } catch (err) {
      console.error("Lỗi check pin:", err);
      toast.error("Lỗi khi kiểm tra pin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleExternalChange = (id: string) => {
    setSelectedExternal((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (!battery) return toast.error("Chưa có dữ liệu pin!");
    try {
      const internalDamageIds = internalDamage.map((i: any) => i.id);
      const damageFeeIds = [...internalDamageIds, ...selectedExternal];

      const res = await api.post(
        `/swap-sessions/${swapSession.id}/calc-damage`,
        { damageFeeIds },
        { withCredentials: true }
      );
      console.log("invoiceID", res.data);
      onUpdate("invoiceId", res.data.data.invoiceId);
      toast.success("Đã gửi danh sách hư hại thành công!");
      onNext?.();
    } catch (err) {
      console.error("Lỗi khi xác nhận hư hại:", err);
      toast.error("Không thể xác nhận hư hại. Vui lòng thử lại!");
    }
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
              <p>Loại pin: {batteryType.name || "Không có dữ liệu"}</p>
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
            {hasOldBattery ? (
              <>
                <p className="text-green-700 font-medium">
                  Mã pin hiện tại: {batteryCode}
                </p>
                <Input
                  id="batteryId"
                  placeholder="VD: LION041"
                  value={batteryCode}
                  onChange={(e) => setBatteryCode(e.target.value)}
                  disabled={loading}
                />
              </>
            ) : (
              <>
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
              </>
            )}

            {/* Nhóm nút kiểm tra pin */}
            <div className="flex flex-col items-center mt-6 gap-4">
              {/* Nút kiểm tra pin & dừng kiểm tra */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={checkBattery}
                  disabled={!batteryCode.trim() || loading}
                  className={`
        flex items-center gap-2 px-8 py-3 text-white font-medium
        transition-all duration-300
        ${
          loading
            ? "bg-[#38A3A5]/70 cursor-not-allowed"
            : "bg-gradient-to-r from-[#38A3A5] to-[#57CC99] hover:brightness-110 hover:shadow-lg"
        }
      `}
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  <span>
                    {loading ? "Đang kiểm tra pin..." : "Kiểm tra pin"}
                  </span>
                </Button>
              </div>

              {/* Nút hủy tiến trình */}
              <Button
                onClick={() => setShowCancelModal(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-3 font-medium hover:brightness-110 hover:shadow-lg transition-all duration-300"
              >
                Hủy tiến trình đổi pin
              </Button>
            </div>
          </div>

          {/* Kết quả pin */}
          {battery && (
            <div className="mt-6 bg-[#F8FCFC] p-6 rounded-xl border border-[#38A3A5]/20 shadow-sm">
              <h3 className="text-lg font-semibold text-[#38A3A5] mb-4 text-center">
                Kết quả pin
              </h3>
              <p>Mã pin: {batteryCode}</p>
              <p>Loại pin: {battery.batteryType}</p>
              <p>Dung lượng: {battery.currentCapacity} Wh</p>
              <p>Cycle count: {battery.cycleCount}</p>
              <p>Voltage: {battery.voltage}</p>
              <p>Nhiệt độ: {battery.temperature} °C</p>
              <p>Ngày sản xuất: {battery.manufacturedAt?.split("T")[0]||"_"}</p>

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

              {filteredExternalDamage.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-[#2D8688]">
                    Hư hại vật lý (external)
                  </h4>
                  {filteredExternalDamage.map((d: any) => (
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
                  className="bg-[#38A3A5] text-white px-10 py-3"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {/* ConfirmModal gọi onCancelProcess từ parent */}
        <ConfirmModal
          open={showCancelModal}
          title="Xác nhận hủy tiến trình"
          description="Bạn có chắc chắn muốn hủy tiến trình đổi pin này không?"
          onClose={() => setShowCancelModal(false)}
          onConfirm={async () => {
            setShowCancelModal(false);
            if (onCancelProcess) await onCancelProcess();
          }}
        />
      </Card>
    </div>
  );
}
