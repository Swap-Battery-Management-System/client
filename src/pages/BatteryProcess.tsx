// BatteryProcess.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Stepper from "@/components/Stepper/Stepper";
import { Step1CheckIn } from "@/components/Stepper/Step1CheckIn";
import Step1WalkinCheckIn from "@/components/Stepper/Step1WalkinCheckIn";
import { Step2CheckPin } from "@/components/Stepper/Step2CheckPin";
import { Step3InstallPin } from "@/components/Stepper/Step3InstallPin";
import { Step4Payment } from "@/components/Stepper/Step4Payment";
import api from "@/lib/api";

export default function BatteryProcess() {
  const { bookingId, swapSessionId } = useParams<{
    bookingId?: string;
    swapSessionId?: string;
  }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);

  const [processData, setProcessData] = useState<any>({
    booking: null,
    user: null,
    vehicle: null,
    newBattery: null,
    newBatteryType: null,
    oldBatteryCode: null,
    station: null,
    checkPinResult: null,
    payment: null,
    swapSession: null,
  });

  const handleUpdateData = (key: string, value: any) => {
    setProcessData((prev: any) => ({ ...prev, [key]: value }));
  };

  const goToNext = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    { id: "checkin", title: "Check-in" },
    { id: "checkpin", title: "Kiểm tra pin" },
    { id: "install", title: "Lắp đặt pin" },
    { id: "payment", title: "Thanh toán" },
  ];

  // ===== Fetch booking lần đầu (dùng khi vào bằng bookingId) =====
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) return;
      try {
        const resBooking = await api.get(`/bookings/${bookingId}`, {
          withCredentials: true,
        });
        const booking = resBooking.data.data.booking;
        handleUpdateData("booking", booking);

        // fetch vehicle, user, station, battery
        const [vehicleRes, userRes, stationRes, batteryRes] = await Promise.all(
          [
            api.get(`/vehicles/${booking.vehicleId}`, {
              withCredentials: true,
            }),
            api.get(`/users/${booking.userId}`, { withCredentials: true }),
            api.get(`/stations/${booking.stationId}`, {
              withCredentials: true,
            }),
            api.get(`/batteries/${booking.batteryId}`, {
              withCredentials: true,
            }),
          ]
        );

        handleUpdateData("vehicle", vehicleRes.data.data.vehicle);
        handleUpdateData("user", userRes.data.data.user);
        handleUpdateData("station", stationRes.data.data.station);
        handleUpdateData("newBattery", batteryRes.data.data.battery);

        const resBatteryType = await api.get(
          `/battery-types/${batteryRes.data.data.battery.batteryTypeId}`,
          { withCredentials: true }
        );
        handleUpdateData(
          "newBatteryType",
          resBatteryType.data.data.batteryType
        );

        // Pin cũ (nếu có)
        if (vehicleRes.data.data.vehicle.batteryId) {
          const oldRes = await api.get(
            `/batteries/${vehicleRes.data.data.vehicle.batteryId}`,
            { withCredentials: true }
          );
          handleUpdateData("oldBatteryCode", oldRes.data.data.battery.code);
        }
      } catch (err) {
        console.error("Không thể load dữ liệu booking:", err);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // ===== Resume process từ swapSessionId (reload trang hoặc mở trực tiếp) =====
  useEffect(() => {
    const resumeFromSwap = async () => {
      const id = swapSessionId || processData.swapSession?.id;
      if (!id) return;

      try {
        const res = await api.get(`/swap-sessions/${id}`, {
          withCredentials: true,
        });
        const session = res.data.swapSession;
        handleUpdateData("swapSession", session);

        // fetch vehicle, user, station
        const [vehicleRes, userRes, stationRes] = await Promise.all([
          api.get(`/vehicles/${session.vehicleId}`, { withCredentials: true }),
          api.get(`/users/${session.userId}`, { withCredentials: true }),
          api.get(`/stations/${session.stationId}`, { withCredentials: true }),
        ]);

        handleUpdateData("vehicle", vehicleRes.data.data.vehicle);
        handleUpdateData("user", userRes.data.data.user);
        handleUpdateData("station", stationRes.data.data.station);

        // Pin mới
        if (session.newBatteryId) {
          const resBattery = await api.get(
            `/batteries/${session.newBatteryId}`,
            {
              withCredentials: true,
            }
          );
          handleUpdateData("newBattery", resBattery.data.data.battery);

          const resType = await api.get(
            `/battery-types/${resBattery.data.data.battery.batteryTypeId}`,
            { withCredentials: true }
          );
          handleUpdateData("newBatteryType", resType.data.data.batteryType);
        }

        // Pin cũ
        if (session.oldBatteryId) {
          const resOld = await api.get(`/batteries/${session.oldBatteryId}`, {
            withCredentials: true,
          });
          handleUpdateData("oldBatteryCode", resOld.data.data.battery.code);
        }

        // set step hiện tại
        const stepMap: any = {
          "in-progress:check-in": 1,
          "in-progress:calc-damage": 2,
          "in-progress:confirm": 3,
          "in-progress:pay": 3,
          completed: 3,
        };
        setCurrentStep(stepMap[session.status] ?? 0);
      } catch (err) {
        console.error("Không thể resume từ swapSessionId:", err);
      }
    };

    resumeFromSwap();
  }, [swapSessionId, processData.swapSession?.id]);

  // ===== Nếu check-in thành công, redirect sang URL swapSession để reload vẫn giữ step =====
  const handleCheckinSuccess = (swapSession: any) => {
    handleUpdateData("swapSession", swapSession);
    navigate(`/battery-process/swap/${swapSession.id}`, { replace: true });
  };

  return (
    <div className="p-6">
      <Stepper
        currentStep={currentStep}
        steps={steps}
        onNext={goToNext}
        onPrev={goToPrev}
      />

      <div className="mt-6">
        {currentStep === 0 && bookingId && (
          <Step1CheckIn
            onNext={goToNext}
            onUpdate={handleUpdateData}
            disabled={!!processData.swapSession}
            data={processData}
            // onCheckinSuccess={handleCheckinSuccess} // truyền callback mới
          />
        )}
        {currentStep === 0 && !bookingId && (
          <Step1WalkinCheckIn
            onNext={goToNext}
            onUpdate={handleUpdateData}
            // onCheckinSuccess={handleCheckinSuccess}
          />
        )}
        {currentStep === 1 && (
          <Step2CheckPin
            onNext={goToNext}
            onPrev={goToPrev}
            data={processData}
          />
        )}
        {currentStep === 2 && (
          <Step3InstallPin
            onNext={goToNext}
            onPrev={goToPrev}
            data={processData}
          />
        )}
        {currentStep === 3 && (
          <Step4Payment
            onPrev={goToPrev}
            // data={processData}
          />
        )}
      </div>
    </div>
  );
}
