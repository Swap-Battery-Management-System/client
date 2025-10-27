import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/api";

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
  name: string;
  email: string;
}

interface Battery {
  id: string;
  code: string;
  capacity: number;
}

interface Station {
  id: string;
  name: string;
}

export function Step1CheckIn({ onNext }: { onNext: () => void }) {
  const [booking, setBooking] = useState<Booking>();
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [user, setUser] = useState<User>();
  const [battery, setBattery] = useState<Battery>();
  const [station, setStation] = useState<Station>();

  useEffect(() => {
    getBookingById();
  }, []);

  useEffect(() => {
    if (booking?.vehicleId) getVehicleById();
    if (booking?.userId) getUserById();
    if (booking?.batteryId) getBatteryById();
    if (booking?.stationId) getStationById();
  }, [booking]);

  const getBookingById = async () => {
    try {
      const res = await api.get(
        `/bookings/2a665fa0-3cc5-4ad7-880e-a10abf05ab20`,
        { withCredentials: true }
      );
      setBooking(res.data.data.booking);
    } catch (err) {
      console.log("Không thể lấy booking", err);
    }
  };

  const getVehicleById = async () => {
    try {
      const res = await api.get(`/vehicles/${booking?.vehicleId}`, {
        withCredentials: true,
      });
      setVehicle(res.data.data);
    } catch (err) {
      console.log("Không thể lấy vehicle", err);
    }
  };

  const getUserById = async () => {
    try {
      const res = await api.get(`/users/${booking?.userId}`, {
        withCredentials: true,
      });
      setUser(res.data.data);
    } catch (err) {
      console.log("Không thể lấy user", err);
    }
  };

  const getBatteryById = async () => {
    try {
      const res = await api.get(`/batteries/${booking?.batteryId}`, {
        withCredentials: true,
      });
      setBattery(res.data.data);
    } catch (err) {
      console.log("Không thể lấy battery", err);
    }
  };

  const getStationById = async () => {
    try {
      const res = await api.get(`/stations/${booking?.stationId}`, {
        withCredentials: true,
      });
      setStation(res.data.data);
    } catch (err) {
      console.log("Không thể lấy station", err);
    }
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

  return (
    <div className="flex justify-center w-full py-12 bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg border border-[#38A3A5]/20 rounded-2xl bg-white">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-[#38A3A5]">
            Xác nhận Check-in
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-gray-800">
            <div>
              <p className="text-sm text-gray-500">Mã đặt lịch</p>
              <p className="font-semibold">{booking?.id || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p className="font-semibold">{booking?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Thời gian hẹn</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ghi chú</p>
              <p className="font-semibold">{booking?.note || "—"}</p>
            </div>

            {/* Người dùng */}
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <p className="font-semibold">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{user?.email || "—"}</p>
            </div>

            {/* Xe */}
            <div>
              <p className="text-sm text-gray-500">Xe</p>
              <p className="font-semibold">
                {vehicle?.model.name || "—"} – {vehicle?.licensePlates || "—"}
              </p>
            </div>

            {/* Pin */}
            <div>
              <p className="text-sm text-gray-500">Pin đặt</p>
              <p className="font-semibold">
                {battery?.code || "—"} ({battery?.capacity || "—"} Wh)
              </p>
            </div>

            {/* Trạm */}
            <div>
              <p className="text-sm text-gray-500">Trạm</p>
              <p className="font-semibold">{station?.name || "—"}</p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onNext}
              className="bg-[#38A3A5] hover:bg-[#2D8688] text-white font-semibold px-10 py-4 shadow-md w-full sm:w-1/2 md:w-1/3 text-lg transition-all"
            >
              Xác nhận Check-in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
