import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Calendar, User, Car, Battery, Recycle, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Step1CheckInProps {
  onNext: () => void;
  onUpdate: (key: string, value: any) => void;
  disabled?: boolean;
  data?: any; // processData từ BatteryProcess
  onCheckinSuccess?: (swapSession: any) => void; // callback khi check-in thành công
}

export function Step1CheckIn({
  onNext,
  onUpdate,
  disabled = false,
  data,
  onCheckinSuccess,
}: Step1CheckInProps) {
  const [loading, setLoading] = useState(!data?.booking);
  const [submitting, setSubmitting] = useState(false);

  const [booking, setBooking] = useState<any>(data?.booking || null);
  const [vehicle, setVehicle] = useState<any>(data?.vehicle || null);
  const [user, setUser] = useState<any>(data?.user || null);
  const [battery, setBattery] = useState<any>(data?.newBattery || null);
  const [oldBattery, setOldBattery] = useState<any>(
    data?.oldBatteryCode || null
  );
  const [batteryType, setBatteryType] = useState<any>(
    data?.newBatteryType || null
  );
  const [station, setStation] = useState<any>(data?.station || null);

  // Nếu chưa có dữ liệu, fetch từ API
  useEffect(() => {
    if (booking && vehicle && user && battery && station) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (!data?.booking?.id) return;

        // Booking
        const resBooking = await api.get(`/bookings/${data.booking.id}`, {
          withCredentials: true,
        });
        const bookingData = resBooking.data.data.booking;
        setBooking(bookingData);
        onUpdate("booking", bookingData);

        // Vehicle, User, Battery, Station
        const [resVehicle, resUser, resBattery, resStation] = await Promise.all(
          [
            api.get(`/vehicles/${bookingData.vehicleId}`, {
              withCredentials: true,
            }),
            api.get(`/users/${bookingData.userId}`, { withCredentials: true }),
            api.get(`/batteries/${bookingData.batteryId}`, {
              withCredentials: true,
            }),
            api.get(`/stations/${bookingData.stationId}`, {
              withCredentials: true,
            }),
          ]
        );

        setVehicle(resVehicle.data.data.vehicle);
        setUser(resUser.data.data.user);
        setBattery(resBattery.data.data.battery);
        setStation(resStation.data.data.station);

        onUpdate("vehicle", resVehicle.data.data.vehicle);
        onUpdate("user", resUser.data.data.user);
        onUpdate("newBattery", resBattery.data.data.battery);
        onUpdate("station", resStation.data.data.station);

        // Battery Type
        const resType = await api.get(
          `/battery-types/${resBattery.data.data.battery.batteryTypeId}`,
          { withCredentials: true }
        );
        setBatteryType(resType.data.data.batteryType);
        onUpdate("newBatteryType", resType.data.data.batteryType);

        // Pin cũ
        if (resVehicle.data.data.vehicle.batteryId) {
          const resOld = await api.get(
            `/batteries/${resVehicle.data.data.vehicle.batteryId}`,
            { withCredentials: true }
          );
          setOldBattery(resOld.data.data.battery);
          onUpdate("oldBatteryCode", resOld.data.data.battery.code);
        }
      } catch (err) {
        console.error("Không thể load dữ liệu Step1CheckIn", err);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data]);

  const handleCheckin = async () => {
    if (!booking || !vehicle || !user || !station) {
      toast.error("Thiếu dữ liệu để check-in!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(
        `/stations/${station.id}/checkin`,
        {
          userId: user.id,
          isWalkin: false,
          bookingId: booking.id,
          vehicleId: vehicle.id,
        },
        { withCredentials: true }
      );

      const swapSession = res.data?.data?.swapSession;
      if (swapSession?.id) {
        onUpdate("swapSession", swapSession);
        toast.success("Check-in thành công!");
        // if (onCheckinSuccess) {
        //   onCheckinSuccess(swapSession);
        // } else {
        //   onNext();
        // }
        onNext();
      } else {
        toast.error("Không lấy được swapSession.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Check-in thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-4xl shadow-md border rounded-2xl bg-white">
        <CardContent className="p-8 space-y-4">
          <h2 className="text-3xl font-bold text-center text-[#38A3A5]">
            Xác nhận Check-in
          </h2>

          {/* Booking */}
          <Section
            icon={<Calendar className="w-5 h-5 text-[#38A3A5]" />}
            title="Thông tin đặt lịch"
          >
            <Info label="Mã đặt lịch" value={booking?.id} />
            <Info label="Trạng thái" value={booking?.status} />
            <Info
              label="Thời gian hẹn"
              value={booking?.scheduleTime
                ?.replace("T", " ")
                .replace(".000Z", "")}
            />
            <Info label="Ghi chú" value={booking?.note || "—"} />
          </Section>

          {/* User */}
          <Section
            icon={<User className="w-5 h-5 text-[#38A3A5]" />}
            title="Thông tin khách hàng"
          >
            <Info label="Họ tên" value={user?.fullName} />
            <Info label="Email" value={user?.email} />
            <Info label="SĐT" value={user?.phoneNumber} />
            <Info label="Địa chỉ" value={user?.address} />
          </Section>

          {/* Vehicle */}
          <Section
            icon={<Car className="w-5 h-5 text-[#38A3A5]" />}
            title="Thông tin xe"
          >
            <Info label="Mã xe" value={vehicle?.id} />
            <Info label="Biển số" value={vehicle?.licensePlates} />
            <Info label="Model" value={vehicle?.model?.name} />
            <Info label="VIN" value={vehicle?.VIN} />
          </Section>

          {/* New Battery */}
          <Section
            icon={<Battery className="w-5 h-5 text-[#38A3A5]" />}
            title="Pin đặt"
          >
            <Info label="Mã pin" value={battery?.id} />
            <Info label="Code" value={battery?.code} />
            <Info label="Loại pin" value={batteryType?.name} />
            <Info
              label="Dung lượng hiện tại (Wh)"
              value={battery?.currentCapacity}
            />
          </Section>

          {/* Old Battery */}
          <Section
            icon={<Recycle className="w-5 h-5 text-[#38A3A5]" />}
            title="Pin cũ"
          >
            {oldBattery ? (
              <>
                <Info label="Mã pin" value={oldBattery.id} />
                <Info
                  label="Loại pin"
                  value={oldBattery?.batteryTypeId || "—"}
                />
              </>
            ) : (
              <p className="text-gray-500 italic">Xe chưa từng đặt pin trước đây.</p>
            )}
          </Section>

          {/* Station */}
          <Section
            icon={<MapPin className="w-5 h-5 text-[#38A3A5]" />}
            title="Trạm sạc"
          >
            <Info label="Tên trạm" value={station?.name} />
            <Info label="Mã trạm" value={station?.id} />
          </Section>

          {/* Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleCheckin}
              disabled={disabled || submitting}
              className={`${
                disabled || submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#38A3A5] hover:bg-[#2D8688]"
              } text-white font-semibold px-10 py-4 shadow-md w-full sm:w-1/2 md:w-1/3 text-lg transition-all`}
            >
              {submitting
                ? "Đang xác nhận..."
                : disabled
                ? "Đã Check-in"
                : "Xác nhận Check-in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Section component
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-lg text-[#2D8688]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
        {children}
      </div>
      <div className="w-full h-px bg-[#38A3A5]/40 mt-4"></div>
    </div>
  );
}

// Info component
function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-right text-[#0F172A] truncate max-w-[65%]">
        {value ?? "—"}
      </p>
    </div>
  );
}
