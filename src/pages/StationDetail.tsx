import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Station } from "@/types/station";

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const permission = localStorage.getItem("permissionUserLocation");

  useEffect(() => {
    if (!id) {
      setError("⚠ Không tìm thấy ID trạm.");
      setLoading(false);
      return;
    }

    //Lấy thông tin trạm
    const fetchStation = async () => {
      try {
        const res = await api.get(`stations/${id}`, { withCredentials: true });
        setStation(res.data.data.station);
        console.log(res.data);
      } catch (err) {
        setError("⚠ Không thể tải thông tin trạm.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  console.log("station:", station);

  //Xử lý loading
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


  //link map
  const mapUrl =
    permission === "granted"
      ? `https://www.google.com/maps?saddr=My+Location&daddr=${station.latitude},${station.longitude}&hl=vi&output=embed`
      : `https://www.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&output=embed`;

  const handleBooking=()=>{
    navigate(`/home/booking`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Map phía trên */}
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
                `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`
              )
            }
            className="px-6 py-2 bg-[#38A3A5] text-white font-semibold rounded-lg hover:bg-[#2e827f] transition-colors"
          >
            Mở trong Google Maps
          </button>
        </div>
      </div>

      {/* Box thông tin trạm */}
      <div className="flex-1 p-6 mt-6">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h1 className="text-2xl font-bold">{station.name}</h1>
          <p className="text-gray-700">Địa chỉ: {station.address}</p>

          <p className="text-gray-700">Pin khả dụng: {station.batteries.filter((s)=>s.status==="available").length}</p>
          <p className="text-gray-700">Đánh giá: {station.avgRating} ⭐</p>

          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-[#38A3A5] text-white font-semibold rounded-lg hover:bg-[#2e827f] transition-colors"
              onClick={handleBooking}>
              Đặt lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
