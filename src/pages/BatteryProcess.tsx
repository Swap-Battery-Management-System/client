import React, { useState } from "react";
import StaffLayout from "@/layout/StaffLayout";
import Stepper from "@/components/Stepper/Stepper";
import { Step1CheckIn } from "@/components/Stepper/Step1CheckIn";
import { Step2CheckPin } from "@/components/Stepper/Step2CheckPin";
import { Step3InstallPin } from "@/components/Stepper/Step3InstallPin";
import { Step4Payment } from "@/components/Stepper/Step4Payment";

export default function BatteryProcess() {
  const [currentStep, setCurrentStep] = useState(0);

  // Dữ liệu chung được truyền giữa các step
  const [processData, setProcessData] = useState({
    booking: null,
    user: null,
    vehicle: null,
    battery: null,
    station: null,
    checkPinResult: null,
    installedBattery: null,
    payment: null,
  });

  // Hàm cập nhật data từ các step con
  const handleUpdateData = (key: string, value: any) => {
    setProcessData((prev) => ({ ...prev, [key]: value }));
  };

  // Khi chuyển bước
  const goToNext = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    { id: "checkin", title: "Check-in" },
    { id: "checkpin", title: "Kiểm tra pin" },
    { id: "install", title: "Lắp đặt pin" },
    { id: "payment", title: "Thanh toán" },
  ];

  return (
      <div className="p-6">
        {/* Thanh stepper */}
        <Stepper currentStep={currentStep} steps={steps} />

        <div className="mt-6">
          {currentStep === 0 && (
            <Step1CheckIn
              onNext={goToNext}
              onUpdate={handleUpdateData}
              disabled={currentStep > 0} // khóa khi đã qua step này
            />
          )}

          {currentStep === 1 && (
            <Step2CheckPin
              onNext={goToNext}
              onPrev={goToPrev}
              // onUpdate={handleUpdateData}
              // data={processData}
              // disabled={currentStep > 1}
            />
          )}

          {currentStep === 2 && (
            <Step3InstallPin
              onNext={goToNext}
              onPrev={goToPrev}
              // onUpdate={handleUpdateData}
              // data={processData}
              // disabled={currentStep > 2}
            />
          )}

          {currentStep === 3 && (
            <Step4Payment
              onPrev={goToPrev}
              // data={processData}
              // onUpdate={handleUpdateData}
            />
          )}
        </div>
      </div>
  );
}
