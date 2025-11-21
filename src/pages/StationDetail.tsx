import api from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Station } from "@/types/station";
import { useAuth } from "@/context/AuthContext";
import { BatteryCharging, BatteryFull, Zap } from "lucide-react";

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const navigate = useNavigate();

  // Fetch station
  useEffect(() => {
    if (!id) {
      setError("⚠ Không tìm thấy ID trạm.");
      setLoading(false);
      return;
    }

    const fetchStation = async () => {
      try {
        const res = await api.get(`stations/${id}`, { withCredentials: true });
        setStation(res.data.data.station);
      } catch {
        setError("⚠ Không thể tải thông tin trạm.");
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  // User location
  useEffect(() => {
    const permission = localStorage.getItem(`permissionUserLocation_${userId}`);
    const storedCoords = localStorage.getItem(`userCoords_${userId}`);

    if (permission === "granted" && storedCoords) {
      try {
        const parsed = JSON.parse(storedCoords);
        if (parsed.lat && parsed.lng) setUserCoords(parsed);
      } catch {
        console.warn("Lỗi đọc tọa độ từ localStorage");
      }
    } else {
      setUserCoords(null);
    }
  }, [userId]);

  // Tính tổng pin và nhóm pin theo loại
  const { totalAvailable, batteryTypeMap } = useMemo(() => {
    if (!station) return { totalAvailable: 0, batteryTypeMap: {} };

    const map: any = {};
    let total = 0;

    station.batteries.forEach((battery: any) => {
      if (battery.status === "available") total++;

      const type = battery.batteryType;
      if (!type) return;

      if (!map[type.id]) {
        map[type.id] = { name: type.name, count: 0 };
      }

      if (battery.status === "available") map[type.id].count++;
    });

    return { totalAvailable: total, batteryTypeMap: map };
  }, [station]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">
        Đang tải thông tin trạm…
      </div>
    );

  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  if (!station)
    return (
      <div className="p-6 text-center text-gray-600">Không tìm thấy trạm.</div>
    );

  const mapUrl = userCoords
    ? `https://www.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${station.latitude},${station.longitude}&hl=vi&output=embed`
    : `https://www.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&z=15&output=embed`;

  const handleBooking = () => {
    navigate(`/home/booking`, { state: { id: station.id } });
  };

  return (
    <div className="bg-[#f5fcfc]">
      {/* MAP */}
      <div className="w-full h-[260px] md:h-[340px] overflow-hidden shadow">
        <iframe
          title="Google Map"
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          src={mapUrl}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Station Info */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">{station.name}</h1>
          <p className="text-sm text-gray-600 mt-1">📍 {station.address}</p>
          <p className="text-sm text-gray-600 mt-1">
            ⭐ {station?.avgRating || "Chưa có đánh giá"}
          </p>
        </div>

        {/* Battery Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BatteryCharging className="text-[#38A3A5]" size={20} />
            Thông tin pin
          </h2>

          {/* Tổng pin */}
          <div className="flex justify-between items-center bg-[#E6F7F7] px-4 py-2 rounded-lg mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Zap size={16} className="text-[#38A3A5]" />
              Tổng pin khả dụng
            </div>
            <span className="bg-[#38A3A5] text-white px-3 py-1 text-sm rounded-full font-semibold">
              {totalAvailable}
            </span>
          </div>

          {/* Danh sách loại pin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(batteryTypeMap).map((type: any, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#f8ffff] px-4 py-2 rounded-md border text-sm"
              >
                <div className="flex items-center gap-2 text-gray-700">
                  <BatteryFull size={16} className="text-[#38A3A5]" />
                  {type.name}
                </div>
                <span className="text-[#38A3A5] font-bold">{type.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Button */}
        <div className="flex justify-end">
          <button
            onClick={handleBooking}
            className="px-7 py-3 bg-[#38A3A5] hover:bg-[#2e827f] text-white font-semibold rounded-full shadow-md transition"
          >
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </div>
  );

}
