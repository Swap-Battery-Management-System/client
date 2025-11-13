import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, CheckCircle } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { ConfirmModal } from "../ConfirmModal";

interface Step3InstallPinProps {
  onNext: () => void;
  onPrev: () => void;
  data: any; // processData từ cha truyền xuống
  onCancelProcess: () => Promise<void>;
}

export function Step3InstallPin({
  onNext,
  onPrev,
  data,
  onCancelProcess,
}: Step3InstallPinProps) {
  const [confirming, setConfirming] = useState(false);

  const battery = data?.newBattery;
  const batteryType = data?.newBatteryType;
  const swapSession = data?.swap;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirm = async () => {
    if (!swapSession?.id) {
      toast.error("Thiếu thông tin phiên đổi pin (swapSessionId)!");
      return;
    }

    if (!battery?.id) {
      toast.error("Thiếu thông tin pin để xác nhận!");
      return;
    }

    setConfirming(true);
    try {
      const res = await api.post(
        `/swap-sessions/${swapSession.id}/confirm`,
        {},
        { withCredentials: true }
      );

      toast.success("Đã xác nhận lắp pin thành công!");
      onNext();
    } catch (err: any) {
      console.error("Lỗi xác nhận lắp pin:", err);
      const message =
        err.response?.data?.message ||
        "Không thể xác nhận lắp pin. Vui lòng thử lại!";
      toast.error(message);
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
            <strong>Mã pin:</strong> {battery.id || "Không xác định"}
          </p>
          <p>
            <strong>Mã code:</strong> {battery.code || "Không có"}
          </p>
          <p>
            <strong>Loại pin:</strong> {batteryType?.name || "Không xác định"}
          </p>
          <p>
            <strong>Dung lượng hiện tại:</strong>{" "}
            {battery.currentCapacity
              ? `${battery.currentCapacity} Wh`
              : "Không rõ"}
          </p>
          <p>
            <strong>Mức SOC:</strong> {battery.soc ?? "Không rõ"}%
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span
              className={
                battery?.status === "reserved"
                  ? "text-green-700 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {battery?.status === "reserved"
                ? "Sẵn sàng lắp"
                : battery?.status
                ? `Lỗi (${battery.status})`
                : "Không xác định"}
            </span>
          </p>
        </div>

        <div className="flex gap-2 pt-2">
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
          {/* Nút hủy tiến trình */}
          <Button
            onClick={() => setShowCancelModal(true)}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-3 font-medium hover:brightness-110 hover:shadow-lg transition-all duration-300"
          >
            Hủy tiến trình đổi pin
          </Button>
        </div>
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
  );
}
