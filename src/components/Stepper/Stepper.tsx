import React from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

type Step = {
  id: string;
  title: string;
  subtitle?: string;
};

type StepperProps = {
  steps?: Step[];
  currentStep?: number; // 0-based index
  onNext?: () => void;
  onPrev?: () => void;
  onGoToStep?: (index: number) => void; // tuỳ chọn, nếu bạn muốn click để nhảy đến step bất kỳ
};

export default function Stepper({
  steps = [
    { id: "checkin", title: "Check-in", subtitle: "Booking detail" },
    { id: "checkpin", title: "Check Pin", subtitle: "Thông số pin" },
    { id: "install", title: "Lắp pin & xác nhận" },
    { id: "payment", title: "Payment" },
  ],
  currentStep = 0,
  onNext,
  onPrev,
  onGoToStep,
}: StepperProps) {
  return (
    <nav aria-label="Progress" className="px-4 py-6">
      <ol className="flex items-center justify-center gap-3 md:gap-6">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          const handleClick = () => {
            if (idx === currentStep) return; // đang ở step hiện tại thì bỏ qua
            if (idx < currentStep) {
              // quay lại step trước
              onPrev?.();
              onGoToStep?.(idx);
            } else {
              // đi tới step kế tiếp
              onNext?.();
              onGoToStep?.(idx);
            }
          };

          return (
            <li
              key={step.id}
              className="flex items-center gap-3 md:gap-6 select-none cursor-pointer"
              aria-current={isActive ? "step" : undefined}
              onClick={handleClick}
            >
              {/* Icon tròn */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                  ${
                    isCompleted
                      ? "bg-[#38A3A5] text-white"
                      : isActive
                      ? "bg-white text-[#38A3A5] ring-2 ring-[#38A3A5]"
                      : "bg-[#EAF8F8] text-gray-400 ring-1 ring-gray-200"
                  }`}
              >
                {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
              </div>

              {/* Tiêu đề */}
              <div className="hidden md:flex flex-col leading-tight text-center">
                <span
                  className={`text-sm font-semibold ${
                    isCompleted
                      ? "text-gray-500 line-through"
                      : isActive
                      ? "text-[#38A3A5]"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {step.subtitle && (
                  <span className="text-xs text-gray-400">{step.subtitle}</span>
                )}
              </div>

              {/* Mũi tên giữa các step */}
              {idx !== steps.length - 1 && (
                <ChevronRight className="hidden md:block text-gray-300" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile condensed bar */}
      <div className="mt-4 md:hidden">
        <div className="w-full h-3 bg-[#EAF8F8] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: "#38A3A5",
            }}
          />
        </div>
        <div className="mt-2 text-xs text-[#38A3A5] text-center font-medium">
          Bước {currentStep + 1} / {steps.length} — {steps[currentStep]?.title}
        </div>
      </div>
    </nav>
  );
}
