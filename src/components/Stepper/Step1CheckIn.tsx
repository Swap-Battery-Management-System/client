import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "react-router-dom";

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
  model: { id: string; name: string };
}

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface Battery {
  id: string;
  code: string;
  currentCapacity: number;
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

        // Load các entity liên quan song song
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

        // Cập nhật state
        setVehicle(vehicleData);
        setUser(userData);
        setBattery(batteryData);
        setStation(stationData);

        // Gửi dữ liệu cho cha
        onUpdate("booking", bookingData);
        onUpdate("vehicle", vehicleData);
        onUpdate("user", userData);
        onUpdate("battery", batteryData);
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

  const handleCheckin = async () => {
    if (!booking) {
      alert("Không tìm thấy checkin!");
      return;
    }

    // try {
    //   setSubmitting(true);
    //   // Gọi API cập nhật trạng thái booking (nếu cần)
    //   await api.put(`/bookings/${booking.id}`, {
    //     status: "checked-in",
    //   });

    //   alert("Check-in thành công!");
    //   onNext();
    // } catch (error) {
    //   console.error("Lỗi khi check-in:", error);
    //   alert("Không thể check-in. Vui lòng thử lại!");
    // } finally {
    //   setSubmitting(false);
    // }
    onNext()
  };

  const formattedDate = booking
    ? new Date(booking.scheduleTime).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex justify-center w-full py-12 bg-gray-50">
        <Card className="w-full max-w-3xl shadow-lg border border-[#38A3A5]/20 rounded-2xl bg-white animate-pulse">
          <CardContent className="p-8 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mt-4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-12 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg border border-[#38A3A5]/20 rounded-2xl bg-white">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-[#38A3A5]">
            Xác nhận Check-in
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-gray-800">
            <Info label="Mã đặt lịch" value={booking?.id} />
            <Info label="Trạng thái" value={booking?.status} />
            <Info label="Thời gian hẹn" value={formattedDate} />
            <Info label="Ghi chú" value={booking?.note || "—"} />
            <Info label="Khách hàng" value={user?.fullName} />
            <Info label="Email" value={user?.email} />
            <Info
              label="Xe"
              value={`${vehicle?.model.name || "—"} – ${
                vehicle?.licensePlates || "—"
              }`}
            />
            <Info
              label="Pin đặt"
              value={`${battery?.code || "—"} (${
                battery?.currentCapacity || "—"
              } Wh)`}
            />
            <Info label="Trạm" value={station?.name} />
          </div>

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

// Component hiển thị gọn thông tin
function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value ?? "—"}</p>
    </div>
  );
}
