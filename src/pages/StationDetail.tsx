import api from "@/lib/api";
import { useEffect, useState } from "react";
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

  // Lấy thông tin trạm
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
      } catch (err) {
        console.error(err);
        setError("⚠ Không thể tải thông tin trạm.");
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  // Đọc quyền và toạ độ người dùng từ localStorage
  useEffect(() => {
    const permission = localStorage.getItem(`permissionUserLocation_${userId}`);
    const storedCoords = localStorage.getItem(`userCoords_${userId}`);

    if (permission === "granted" && storedCoords) {
      try {
        const parsed = JSON.parse(storedCoords);
        if (parsed.lat && parsed.lng) setUserCoords(parsed);
      } catch {
        console.warn("Lỗi đọc toạ độ từ localStorage");
      }
    } else {
      setUserCoords(null);
    }
  }, [userId]);

  // Trạng thái hiển thị
  if (loading)
    return (
      <div className="p-6 text-center text-gray-700">
        Đang tải thông tin trạm…
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center bg-red-100 text-red-800 font-semibold rounded-md shadow-md">
        {error}
      </div>
    );
  if (!station)
    return (
      <div className="p-6 text-center text-gray-700">Không tìm thấy trạm.</div>
    );

  // URL bản đồ (không cần API key)
  const mapUrl = userCoords
    ? // Có vị trí thật → hiển thị đường đi
      `https://www.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${station.latitude},${station.longitude}&hl=vi&output=embed`
    : // Không có quyền → chỉ hiển thị trạm
      `https://www.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&z=15&output=embed`;

  // Điều hướng đặt lịch
  const handleBooking = () => {
    navigate(`/home/booking`, { state: { id: station.id } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Bản đồ */}
      <div className="w-full h-64 md:h-96 bg-gray-200 relative rounded-b-lg overflow-hidden">
        <iframe
          title="Google Map Directions"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
        <div className="flex justify-end mt-4 absolute bottom-4 right-4">
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&hl=vi`
              )
            }
            className="px-6 py-2 bg-[#38A3A5] text-white font-semibold rounded-lg hover:bg-[#2e827f] transition-colors"
          >
            Mở trong Google Maps
          </button>
        </div>
      </div>

      {/* Thông tin trạm */}
      <div className="flex-1 p-6 mt-6">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h1 className="text-2xl font-bold">{station.name}</h1>
          <p className="text-gray-700">Địa chỉ: {station.address}</p>

          <p className="text-gray-700">
            Pin khả dụng:{" "}
            {station.batteries.filter((s) => s.status === "available").length}
          </p>
          <p className="text-gray-700">Đánh giá: {station.avgRating} ⭐</p>

          <div className="flex justify-end mt-4">
            <button
              className="px-6 py-2 bg-[#38A3A5] text-white font-semibold rounded-lg hover:bg-[#2e827f] transition-colors"
              onClick={handleBooking}
            >
              Đặt lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
