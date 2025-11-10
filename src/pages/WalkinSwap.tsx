import React, { useState } from "react";
import Stepper from "@/components/Stepper/Stepper";
import Step1WalkinCheckIn from "@/components/Stepper/Step1WalkinCheckIn";
import { Step2CheckPin } from "@/components/Stepper/Step2CheckPin";
import { Step3InstallPin } from "@/components/Stepper/Step3InstallPin";
import { Step4Payment } from "@/components/Stepper/Step4Payment";

export default function WalkinSwap() {
  const [currentStep, setCurrentStep] = useState(0);
  const [processData, setProcessData] = useState({
      user: null,
      vehicle: null,
      newBattery: null,
      newBatteyType:null,
      oldBattery:null,
      station: null,
      checkPinResult: null,
      payment: null,
    });
  

   const handleUpdateData = (key: string, value: any) => {
     setProcessData((prev) => ({ ...prev, [key]: value }));
   };

  const goToNext = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    { id: "checkin", title: "Check-in người dùng" },
    { id: "checkpin", title: "Kiểm tra pin" },
    { id: "install", title: "Lắp đặt pin" },
    { id: "payment", title: "Thanh toán" },
  ];

  return (
      <div className="p-6">
        <Stepper
          currentStep={currentStep}
          steps={steps}
          onNext={goToNext}
          onPrev={goToPrev}
        />

        <div className="mt-6">
          {currentStep === 0 && (
            <Step1WalkinCheckIn onNext={goToNext} onUpdate={handleUpdateData} />
          )}

          {currentStep === 1 && (
                      <Step2CheckPin
                        onNext={goToNext}
                        onPrev={goToPrev}
                        // onUpdate={handleUpdateData}
                        data={processData}
                        // disabled={currentStep > 1}
                      />
                    )}
          
                    {currentStep === 2 && (
                      <Step3InstallPin
                        onNext={goToNext}
                        onPrev={goToPrev}
                        // onUpdate={handleUpdateData}
                        data={processData}
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
