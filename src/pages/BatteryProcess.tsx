// pages/staff/battery-process.tsx
import React, { useState } from "react";
import StaffLayout from "@/layout/StaffLayout";
import Stepper from "@/components/Stepper/Stepper";
import { Step1CheckIn } from "@/components/Stepper/Step1CheckIn";
import { Step2CheckPin } from "@/components/Stepper/Step2CheckPin";
import { Step3InstallPin } from "@/components/Stepper/Step3InstallPin";
import { Step4Payment } from "@/components/Stepper/Step4Payment";
export default function BatteryProcess() {
  const [step, setStep] = useState(0);

  return (

      <div className="p-6">
        <Stepper currentStep={step}/>
        <div className="mt-6">
          {step === 0 && <Step1CheckIn onNext={() => setStep(1)} />}
          {step === 1 && (
            <Step2CheckPin
              onNext={() => setStep(2)}
              onPrev={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <Step3InstallPin
              onNext={() => setStep(3)}
              onPrev={() => setStep(1)}
            />
          )}
          {step === 3 && <Step4Payment onPrev={() => setStep(2)} />}
        </div>
      </div>
  
  );
}
