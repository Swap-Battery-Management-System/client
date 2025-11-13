import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Stepper from "@/components/Stepper/Stepper";
import { Step1CheckIn } from "@/components/Stepper/Step1CheckIn";
import Step1WalkinCheckIn from "@/components/Stepper/Step1WalkinCheckIn";
import { Step2CheckPin } from "@/components/Stepper/Step2CheckPin";
import { Step3InstallPin } from "@/components/Stepper/Step3InstallPin";
import { Step4Payment } from "@/components/Stepper/Step4Payment";
import api from "@/lib/api";
import { toast } from "sonner";

export default function BatteryProcess() {
  const { bookingId, swapSessionId } = useParams<{
    bookingId?: string;
    swapSessionId?: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); // 👈 Thêm state loading
  const [currentSwapId, setCurrentSwapId] = useState<string | null>(
    swapSessionId || null
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [processData, setProcessData] = useState<any>({
    booking: null,
    user: null,
    vehicle: null,
    newBattery: null,
    newBatteryType: null,
    oldBattery: null,
    oldBatteryType: null,
    station: null,
    checkPinResult: null,
    payment: null,
    swapSession: null,
    invoiceId: null,
  });

  const handleUpdateData = (key: string, value: any) => {
    setProcessData((prev: any) => ({ ...prev, [key]: value }));
  };

  const goToNext = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 0, 0));

  const steps = [
    { id: "checkin", title: "Check-in" },
    { id: "checkpin", title: "Kiểm tra pin" },
    { id: "install", title: "Lắp đặt pin" },
    { id: "payment", title: "Thanh toán" },
  ];

  // ===== Hủy tiến trình swap session =====
  const handleCancelProcess = async () => {
    if (!processData.swapSession?.id) return;

    try {
      await api.patch(
        `/swap-sessions/${processData.swapSession.id}/cancel`,{},
        { withCredentials: true }
      );

      // Reset toàn bộ dữ liệu process
      setProcessData({
        booking: processData.booking, // giữ booking để nhập lại pin nếu cần
        user: processData.user,
        vehicle: processData.vehicle,
        newBattery: null,
        newBatteryType: null,
        oldBattery: null,
        oldBatteryType: null,
        station: processData.station,
        checkPinResult: null,
        payment: null,
        swapSession: null,
      });
      toast.success("Hủy tiến trình thành công");
      setCurrentSwapId(null); // quay về bước đầu
      navigate("/staff/swap-session"); // điều hướng về list swap session
    } catch (err) {
      console.error("Lỗi khi hủy tiến trình swap session:", err);
      toast.error("Không thể hủy tiến trình");
    } 
  };

  // ===== Fetch booking khi có bookingId =====
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) return;
      setLoading(true);

      try {
        const resBooking = await api.get(`/bookings/${bookingId}`, {
          withCredentials: true,
        });
        const booking = resBooking.data.data.booking;
        handleUpdateData("booking", booking);

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

        if (vehicleRes.data.data.vehicle.batteryId) {
          const oldRes = await api.get(
            `/batteries/${vehicleRes.data.data.vehicle.batteryId}`,
            { withCredentials: true }
          );
          handleUpdateData("oldBattery", oldRes.data.data.battery);

          const resOldBatteryType = await api.get(
            `/battery-types/${oldRes.data.data.battery.batteryTypeId}`,
            { withCredentials: true }
          );
          handleUpdateData(
            "oldBatteryType",
            resOldBatteryType.data.data.batteryType
          );
        }
      } catch (err) {
        console.error("Không thể load dữ liệu booking:", err);
      } finally {
        setLoading(false); // tắt loading
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // ===== Resume process từ swapSessionId URL =====
  useEffect(() => {
    const resumeFromSwap = async () => {
      if (!currentSwapId) return;
      setLoading(true); // bật loading

      try {
        const res = await api.get(`/swap-sessions/${currentSwapId}`, {
          withCredentials: true,
        });
        const session = res.data.data || res.data.data?.swapSession;
        if (!session) return;

        handleUpdateData("swapSession", session);
        //luu invoiceId
        handleUpdateData("invoiceId", res.data.data.invoiceId);

        const [vehicleRes, userRes, stationRes] = await Promise.all([
          api.get(`/vehicles/${session.vehicleId}`, { withCredentials: true }),
          api.get(`/users/${session.userId}`, { withCredentials: true }),
          api.get(`/stations/${session.stationId}`, { withCredentials: true }),
        ]);

        handleUpdateData("vehicle", vehicleRes.data.data.vehicle);
        handleUpdateData("user", userRes.data.data.user);
        handleUpdateData("station", stationRes.data.data.station);

        if (session.newBatteryId) {
          const resBattery = await api.get(
            `/batteries/${session.newBatteryId}`,
            { withCredentials: true }
          );
          const newBattery = resBattery.data.data.battery;
          handleUpdateData("newBattery", newBattery);

          const resType = await api.get(
            `/battery-types/${newBattery.batteryTypeId}`,
            { withCredentials: true }
          );
          handleUpdateData("newBatteryType", resType.data.data.batteryType);
        }

        if (session.oldBatteryId) {
          const resOld = await api.get(`/batteries/${session.oldBatteryId}`, {
            withCredentials: true,
          });
          const oldBattery = resOld.data.data.battery;
          handleUpdateData("oldBattery", oldBattery);

          const resOldType = await api.get(
            `/battery-types/${oldBattery.batteryTypeId}`,
            { withCredentials: true }
          );
          handleUpdateData("oldBatteryType", resOldType.data.data.batteryType);
        }

        const stepMap: Record<string, number> = {
          "in-progress:check-in": 1,
          "in-progress:calc-damage": 2,
          "in-progress:confirm": 3,
          "in-progress:pay": 3,
          completed: 3,
        };
        setCurrentStep(stepMap[session.status] ?? 0);
      } catch (err) {
        console.error("Không thể resume swapSessionId:", err);
      } finally {
        setLoading(false); 
      }
    };

    resumeFromSwap();
  }, [currentSwapId]);

  const handleCheckinSuccess = (swapSession: any) => {
    handleUpdateData("swapSession", swapSession);
    setCurrentSwapId(swapSession.id);
    navigate(`/staff/battery-process/swap/${swapSession.id}`, {
      replace: true,
    });
  };

  return (
    <div className="p-6">
      <Stepper
        currentStep={currentStep}
        steps={steps}
        onNext={goToNext}
        onPrev={goToPrev}
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38A3A5] mb-4"></div>
          <p className="text-[#38A3A5] text-lg font-medium">
            Hệ thống đang tải dữ liệu...
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {currentStep === 0 && bookingId && (
            <Step1CheckIn
              onNext={goToNext}
              onUpdate={handleUpdateData}
              disabled={!!processData.swapSession}
              data={processData}
              onCheckinSuccess={handleCheckinSuccess}
            />
          )}
          {currentStep === 0 && !bookingId && !currentSwapId && (
            <Step1WalkinCheckIn onNext={goToNext} onUpdate={handleUpdateData} />
          )}
          {currentStep === 1 && (
            <Step2CheckPin
              onNext={goToNext}
              onPrev={goToPrev}
              data={processData}
              onCancelProcess={handleCancelProcess}
            />
          )}
          {currentStep === 2 && (
            <Step3InstallPin
              onNext={goToNext}
              onPrev={goToPrev}
              data={processData}
              onCancelProcess={handleCancelProcess}
              // onUpdate={handleUpdateData} 
            />
          )}
          {currentStep === 3 && <Step4Payment onPrev={goToPrev} />}
        </div>
      )}
    </div>
  );
}
