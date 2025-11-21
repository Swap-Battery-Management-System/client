import api from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Station } from "@/types/station";
import { useAuth } from "@/context/AuthContext";

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
    <div className="min-h-screen bg-gradient-to-br from-[#f0fbfb] to-white">
      {/* MAP */}
      <div className="w-full h-64 md:h-96 relative rounded-b-3xl overflow-hidden shadow-lg">
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={mapUrl}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Station Info */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">{station.name}</h1>
          <p className="text-gray-600">📍 {station.address}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-bold mb-3 text-gray-800">
            ⚡ Thông tin pin
          </h2>

          {/* Tổng pin */}
          <div className="flex items-center bg-[#e0f7fa] p-2 rounded-lg mb-2">
            <span className="font-semibold text-gray-700 text-sm">
              Tổng pin khả dụng
            </span>
            <span className="text-white bg-[#38A3A5] px-2 py-0.5 rounded-full text-sm font-semibold ml-2">
              {totalAvailable}
            </span>
          </div>

          {/* Chi tiết từng loại pin */}
          <div className="space-y-1">
            {Object.values(batteryTypeMap).map((type: any, index) => (
              <div
                key={index}
                className="flex items-center justify-start bg-[#f0fdfd] p-2 rounded-lg hover:bg-[#e0f7fa] transition"
              >
                <span className="text-gray-700 text-sm font-medium flex items-center">
                  🔋 {type.name} -
                  <span className="ml-2 text-[#38A3A5] font-semibold">
                    {type.count}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Button */}
        <div className="text-right">
          <button
            onClick={handleBooking}
            className="px-8 py-3 bg-gradient-to-r from-[#38A3A5] to-[#2e827f] text-white font-semibold rounded-full shadow-lg hover:scale-105 transition transform"
          >
            Đặt lịch ngay
          </button>
        </div>
      </div>
    </div>
  );
}
