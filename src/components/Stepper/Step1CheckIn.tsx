import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "react-router-dom";
import { Calendar, User, Car, Battery, Recycle, MapPin } from "lucide-react"; // ⬅️ icon từ lucide-react

interface Booking {
  id: string;
  scheduleTime: string;
  note: string;
  status: string;
  userId: string;
  vehicleId: string;
  batteryId: string;
  stationId: string;
}

interface Vehicle {
  id: string;
  licensePlates: string;
  VIN: string;
  model: { id: string; name: string };
  batteryId: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

interface Battery {
  id: string;
  code: string;
  currentCapacity: number;
  cycleCount: number;
  soc: number;
  batteryTypeId: string;
}

interface BatteryType {
  id: string;
  name: string;
}

interface Station {
  id: string;
  name: string;
}

interface Step1CheckInProps {
  onNext: () => void;
  onUpdate: (key: string, value: any) => void;
  disabled?: boolean;
}

export function Step1CheckIn({
  onNext,
  onUpdate,
  disabled = false,
}: Step1CheckInProps) {
  const [booking, setBooking] = useState<Booking>();
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [user, setUser] = useState<User>();
  const [battery, setBattery] = useState<Battery>();
  const [oldBattery, setOldBattery] = useState<Battery>();
  const [batteryType, setBatteryType] = useState<BatteryType>();
  const [oldBatteryType, setOldBatteryType] = useState<BatteryType>();
  const [station, setStation] = useState<Station>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { bookingId } = useParams<{ bookingId: string }>();

  useEffect(() => {
    const fetchAllData = async () => {
      if (!bookingId) return;
      try {
        setLoading(true);
        const resBooking = await api.get(`/bookings/${bookingId}`, {
          withCredentials: true,
        });
        const bookingData: Booking = resBooking.data.data.booking;
        setBooking(bookingData);

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

        const vehicleData = resVehicle.data.data.vehicle;
        const userData = resUser.data.data.user;
        const batteryData = resBattery.data.data.battery;
        const stationData = resStation.data.data.station;

        setVehicle(vehicleData);
        setUser(userData);
        setBattery(batteryData);
        setStation(stationData);

        const resBatteryType = await api.get(
          `/battery-types/${batteryData.batteryTypeId}`,
          { withCredentials: true }
        );
        setBatteryType(resBatteryType.data.data.batteryType);

        // Pin cũ
        if (vehicleData.batteryId) {
          const resOldBattery = await api.get(
            `/batteries/${vehicleData.batteryId}`,
            { withCredentials: true }
          );
          const oldB = resOldBattery.data.data.battery;
          setOldBattery(oldB);
          onUpdate("oldBattery", oldB);
          const resOldType = await api.get(
            `/battery-types/${oldB.batteryTypeId}`,
            { withCredentials: true }
          );
          setOldBatteryType(resOldType.data.data.batteryType);
        }

        onUpdate("booking", bookingData);
        onUpdate("vehicle", vehicleData);
        onUpdate("user", userData);
        onUpdate("Newbattery", batteryData);
        onUpdate("station", stationData);
      } catch (err) {
        console.error("Không thể load dữ liệu đầy đủ", err);
        alert("Không thể tải dữ liệu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [bookingId]);

  const handleCheckin = () => {
    if (!booking) {
      alert("Không tìm thấy checkin!");
      return;
    }
    onNext();
  };

  const formattedDate = booking?.scheduleTime
    ? booking.scheduleTime.replace("T", " ").replace(".000Z", "")
    : "Chưa có";

  if (loading) {
    return (
      <div className="flex justify-center w-full py-12 bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-12 bg-gray-50">
      <Card className="w-full max-w-4xl shadow-md border border-[#38A3A5]/20 rounded-2xl bg-white">
        <CardContent className="p-8 space-y-4">
          <h2 className="text-3xl font-bold text-center text-[#38A3A5] mb-2">
            Xác nhận Check-in
          </h2>

          {/* Booking Info */}
          <Section
            icon={<Calendar className="w-5 h-5 text-[#38A3A5]" />}
            title="Thông tin đặt lịch"
          >
            <Info label="Mã đặt lịch" value={booking?.id} />
            <Info label="Trạng thái" value={booking?.status} />
            <Info label="Thời gian hẹn" value={formattedDate} />
            <Info label="Ghi chú" value={booking?.note || "—"} />
          </Section>

          {/* User Info */}
          <Section
            icon={<User className="w-5 h-5 text-[#38A3A5]" />}
            title="Thông tin khách hàng"
          >
            <Info label="Họ tên" value={user?.fullName} />
            <Info label="Email" value={user?.email} />
            <Info label="Số điện thoại" value={user?.phoneNumber} />
            <Info label="Địa chỉ" value={user?.address} />
          </Section>

          {/* Vehicle Info */}
          <Section
            icon={<Car className="w-5 h-5 text-[#38A3A5]" />}
            title="Thông tin xe"
          >
            <Info label="Mã xe" value={vehicle?.id} />
            <Info label="Biển số" value={vehicle?.licensePlates} />
            <Info label="Model" value={vehicle?.model?.name} />
            <Info label="Số khung (VIN)" value={vehicle?.VIN} />
          </Section>

          {/* New Battery Info */}
          <Section
            icon={<Battery className="w-5 h-5 text-[#38A3A5]" />}
            title="Pin đặt"
          >
            <Info label="Mã pin" value={battery?.id} />
            <Info label="Mã code" value={battery?.code} />
            <Info label="Loại pin" value={batteryType?.name} />
            <Info
              label="Dung lượng hiện tại (Wh)"
              value={battery?.currentCapacity}
            />
          </Section>

          {/* Old Battery Info */}
          <Section
            icon={<Recycle className="w-5 h-5 text-[#38A3A5]" />}
            title="Pin cũ của xe"
          >
            {oldBattery ? (
              <>
                <Info label="Mã pin" value={oldBattery.id} />
                <Info
                  label="Loại pin"
                  value={oldBatteryType?.name || "Không xác định"}
                />
              </>
            ) : (
              <p className="text-gray-500 italic">
                Xe hiện chưa từng được gắn hoặc đặt pin trước đây.
              </p>
            )}
          </Section>

          {/* Station Info */}
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
    <div className="relative">
      {/* Đường kẻ xanh ngăn cách */}
      <div className="w-full h-px bg-[#38A3A5]/40 my-6"></div>

      <div className="bg-gray-50/30">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-semibold text-lg text-[#2D8688]">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-[#0F172A] text-right truncate max-w-[65%]">
        {value ?? "—"}
      </p>
    </div>
  );
}
