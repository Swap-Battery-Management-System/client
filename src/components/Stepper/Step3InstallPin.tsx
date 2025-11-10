import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Step3InstallPinProps {
  onNext: () => void;
  onPrev: () => void;
  data: any; // processData từ cha truyền xuống
}

export function Step3InstallPin({
  onNext,
  onPrev,
  data,
}: Step3InstallPinProps) {
  const [confirming, setConfirming] = useState(false);

  const battery = data?.newBattery;
  const batteryType = data?.newBatteryType;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // 👉 Nếu có API xác nhận lắp pin, gọi ở đây:
      // await api.post(`/swap-sessions/${data.swapSessionId}/confirm-install`, {}, { withCredentials: true });
      onNext();
    } catch (err) {
      console.error("Lỗi xác nhận lắp pin:", err);
      alert("Không thể xác nhận lắp pin. Vui lòng thử lại!");
    } finally {
      setConfirming(false);
    }
  };

  if (!battery) {
    return (
      <Card className="max-w-md mx-auto border border-gray-200 shadow-sm">
        <CardContent className="p-6 text-center text-gray-500">
          ⚠️ Chưa có thông tin pin mới.
          <br /> Vui lòng quay lại bước trước để kiểm tra lại.
          <div className="mt-4">
            <Button variant="outline" onClick={onPrev}>
              Quay lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto border border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#38A3A5] flex items-center gap-2">
          <Battery className="w-5 h-5 text-[#38A3A5]" />
          Lắp pin & xác nhận
        </h2>

        <div className="text-sm text-gray-700 space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p>
            <strong>Mã pin:</strong> {battery.id}
          </p>
          <p>
            <strong>Mã code:</strong> {battery.code}
          </p>
          <p>
            <strong>Loại pin:</strong> {batteryType?.name || "Không xác định"}
          </p>
          <p>
            <strong>Dung lượng hiện tại:</strong> {battery.currentCapacity} Wh
          </p>
          <p>
            <strong>Mức SOC:</strong> {battery.soc}%
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className="text-green-700 font-medium">
              {battery?.status === "reserved"
                ? "sẵn sàng lắp"
                : battery?.status?`Lỗi (${battery.status})`:"Không xác định"}
            </span>
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onPrev}
            className="flex-1"
            disabled={confirming}
          >
            Quay lại
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-[#38A3A5] hover:bg-[#2D8688] text-white flex-1 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>Đang xác nhận...</>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Xác nhận lắp pin
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
