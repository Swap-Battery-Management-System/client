import StationCard from "@/components/StationCard";
import SearchStation from "@/components/SearchStation";
import { use, useEffect, useState } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { MdMyLocation } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { Station } from "@/types/station";

type locationState = {
  id?: string;
};

export default function FindStation() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // state loading
  const [showModal, setShowModal] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    () => {
      const saved = localStorage.getItem("userCoords");
      return saved ? JSON.parse(saved) : null;
    }
  );
  const location = useLocation();
  const keyword = (location.state as { keyword?: string })?.keyword || "";
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStation, setFilteredStation] = useState<Station[]>([]);

  //lấy danh sách trạm
  const featchAllStation = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stations", { withCredentials: true });
      const data: Station[] = res.data.data.station;
      setStations(data);
      console.log("ds tram: ", res.data);
    } catch (err) {
      console.log("Lỗi khi lấy danh sách trạm:", err);
    } finally {
      setLoading(false);
    }
  };

  //Lọc theo từ khóa
  const filterByKeyword = (kw: string) => {
    if (!kw.trim()) {
      setFilteredStation(stations);
      return;
    }
    const result = stations.filter(
      (s) =>
        s.name.toLowerCase().includes(kw.toLowerCase()) ||
        s.address.toLowerCase().includes(kw.toLowerCase())
    );
    setFilteredStation(result);
  };

  //Lọc theo vị trí (tính khoảng cách)
  const filterByLocation = () => {
    setFilteredStation(stations);
  };

  //lưu vị trí vô localStorage
  useEffect(() => {
    if (coords) {
      localStorage.setItem("userCoords", JSON.stringify(coords));
    }
  }, [coords]);

  //theo dõi theo thời gian thực
  useEffect(() => {
    const permission = localStorage.getItem("permissionUserLocation");
    if (permission === "granted") {
      startWatchingLocation();
    } else if (permission === "denied") {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, []);

  //lấy danh sách trạm
  useEffect(() => {
    featchAllStation();
  }, []);

  //khi có keyword hoặc coords
  useEffect(() => {
    if (keyword) {
      filterByKeyword(keyword);
    } else if (coords) {
      filterByLocation();
    } else {
      setFilteredStation(stations);
    }
  }, [keyword, coords, stations]);

  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Trình duyệt không hỗ trợ định vị!");
      setShowModal(false);
      return;
    }

    setLoading(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        localStorage.setItem("userCoords", JSON.stringify(newCoords));
        console.log("Vị trí hiện tại:", latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("Không thể lấy vị trí. Vui lòng thử lại.", error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  };

  //xử lý đống ý truy cập vị trí
  const handleAllow = () => {
    localStorage.setItem("permissionUserLocation", "granted");
    setShowModal(false);
    startWatchingLocation();
  };

  const handleDeny = () => {
    localStorage.setItem("permissionUserLocation", "denied");
    setShowModal(false);
  };

  const handleViewDetail = (station: Station) => {
    navigate(`/home/find-station/station-detail/${station.id}`);
  };


  return (
    <>
      {showModal && (
        <LocationPermissionModal
          onAllow={handleAllow}
          onDeny={handleDeny}
          loading={loading}
        />
      )}

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        {/* Thanh search */}
        <div className="mb-10 flex justify-center">
          <div className="flex gap-2 max-w-lg w-full">
            {/* input search chiếm hết chỗ còn lại */}
            <div className="flex-1">
              <SearchStation />
            </div>
          </div>
        </div>

        {/* Danh sách trạm */}
        <div className="max-w-5xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading… Chỉ một lát thôi 😄
            </div>
          ) : !filteredStation || filteredStation.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Hiện tại không tìm thấy trạm nào 😢
            </div>
          ) : (
            filteredStation.map((station) => (
              <StationCard
                key={station.id}
                pinAvailable={20}
                station={station}
                onclick={() => handleViewDetail(station)}
              />
            ))
          )}
        </div>
      </div>
      {/* Button định vị cố định góc phải dưới màn hình */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-5 right-5 p-3 bg-[#38A3A5] text-white rounded-full hover:bg-[#2e827f] hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center z-50"
        title="Dùng vị trí để tìm trạm gần bạn"
      >
        <MdMyLocation size={20} />
      </button>
    </>
  );
}
