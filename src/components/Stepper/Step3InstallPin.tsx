import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Step3InstallPin({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const mockBattery = {
    id: "FFC7D100-47A0-44D0-AD2D-3579AD0950D9",
    capacity: "98%",
    status: "Sẵn sàng",
  };

  return (
    <Card className="max-w-md mx-auto border border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-green-700">
          Lắp pin & xác nhận
        </h2>

        <div className="text-sm text-gray-700 space-y-1 bg-gray-50 rounded-lg p-4">
          <p>
            <strong>Mã pin:</strong> {mockBattery.id}
          </p>
          <p>
            <strong>Dung lượng:</strong> {mockBattery.capacity}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className="text-green-700">{mockBattery.status}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrev} className="flex-1">
            Quay lại
          </Button>
          <Button
            onClick={onNext}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            Xác nhận lắp đặt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
