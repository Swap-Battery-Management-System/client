import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// === Step 2: Check Pin ===
export function Step2CheckPin({
  onNext,
  onPrev,
  data,
}: {
  onNext: () => void;
  onPrev: () => void;
  data:any;
}) {
  const initialBatteryId = data?.oldBattery?.id || "";
  const [batteryId, setBatteryId] = useState(initialBatteryId);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (batteryId.trim()) setChecked(true);
  };

  return (
    <div className="flex justify-center w-full py-12 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg border border-[#38A3A5]/20 bg-white rounded-2xl">
        <CardContent className="p-10 space-y-8">
          {/* Tiêu đề */}
          <h2 className="text-2xl font-bold text-center text-[#38A3A5]">
            Kiểm tra thông số pin
          </h2>

          {/* Nhập mã pin */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="batteryId"
                className="text-gray-700 font-medium text-base"
              >
                Nhập mã pin cần kiểm tra
              </Label>
              <Input
                id="batteryId"
                placeholder="VD: LION041"
                value={batteryId}
                onChange={(e) => setBatteryId(e.target.value)}
                className="border-gray-300 focus:border-[#38A3A5] focus:ring-[#38A3A5]"
              />
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4 pt-2">
              <Button
                variant="outline"
                onClick={onPrev}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleCheck}
                className="flex-1 bg-[#38A3A5] hover:bg-[#2D8688] text-white font-semibold"
              >
                Kiểm tra
              </Button>
            </div>
          </div>

          {/* Kết quả kiểm tra */}
          {checked && (
            <div className="mt-6 bg-[#F8FCFC] rounded-xl p-6 border border-[#38A3A5]/10 shadow-sm">
              <h3 className="text-lg font-semibold text-[#38A3A5] mb-4 text-center">
                Kết quả kiểm tra
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-gray-800">
                <p>
                  <span className="text-gray-500">Mã pin:</span>{" "}
                  <strong>{batteryId}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Dung lượng:</span>{" "}
                  <strong>98%</strong>
                </p>
                <p>
                  <span className="text-gray-500">Trạng thái:</span>{" "}
                  <strong className="text-green-600">Tốt</strong>
                </p>
                <p>
                  <span className="text-gray-500">Nhiệt độ:</span>{" "}
                  <strong>32°C</strong>
                </p>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={onNext}
                  className="bg-[#38A3A5] hover:bg-[#2D8688] text-white font-semibold px-10 py-4 rounded-xl shadow-md w-full sm:w-1/2 md:w-1/3 text-lg transition-all"
                >
                  Tiếp tục lắp pin
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
