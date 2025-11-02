import StationCard from "@/components/StationCard";
import SearchStation from "@/components/SearchStation";
import { useEffect, useState, useRef } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { MdMyLocation } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import type { Station } from "@/types/station";
import { useStation } from "@/context/StationContext";
import { useAuth } from "@/context/AuthContext";

export default function FindStation() {
  const navigate = useNavigate();
  const location = useLocation();
  const keywordFromState =
    (location.state as { keyword?: string })?.keyword || "";

  const { user } = useAuth();
  const userId = user?.id || "guest";

  const {
    fetchAllStation,
    stations,
    loading: loadingStations,
    getStationWithDistance,
  } = useStation();

  const [filteredStation, setFilteredStation] = useState<Station[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    () => {
      const saved = localStorage.getItem(`userCoords_${userId}`);
      return saved ? JSON.parse(saved) : null;
    }
  );
  const [showModal, setShowModal] = useState(false);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const [keyword, setKeyword] = useState(keywordFromState);

  //Fetch stations chỉ khi chưa có
  useEffect(() => {
    if (!stations || stations.length === 0) fetchAllStation();
  }, [stations, fetchAllStation]);

  // Permission và theo dõi vị trí
  useEffect(() => {
    const permission = localStorage.getItem(`permissionUserLocation_${userId}`);
    if (permission === "granted") watchIdRef.current = startWatchingLocation();
    else if (permission === "denied") setShowModal(false);
    else setShowModal(true);

    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [userId]);

  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị.");
      return null;
    }

    setLoadingCoords(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(newCoords);
        console.log("coords updated:", newCoords);
        setLoadingCoords(false);
      },
      (err) => setLoadingCoords(false),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return id;
  };

  const handleAllow = () => {
    localStorage.setItem(`permissionUserLocation_${userId}`, "granted");
    setShowModal(false);
    watchIdRef.current = startWatchingLocation();
  };

  const handleDeny = () => {
    localStorage.setItem(`permissionUserLocation_${userId}`, "denied");
    localStorage.removeItem(`userCoords_${userId}`);
    setCoords(null);
    setShowModal(false);
  };

  //  Lọc station + tính khoảng cách
  useEffect(() => {
    if (!stations || stations.length === 0) return;

    let result = stations;

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(k) ||
          s.address.toLowerCase().includes(k)
      );
    }

    if (coords) {
      // async không block UI
      getStationWithDistance(coords, result).then(setFilteredStation);
    } else {
      setFilteredStation(result);
    }
  }, [keyword, coords, stations, getStationWithDistance]);

  // 4️Lưu coords
  useEffect(() => {
    if (coords)
      localStorage.setItem(`userCoords_${userId}`, JSON.stringify(coords));
  }, [coords, userId]);

  const handleViewDetail = (station: Station) => {
    navigate(`/home/find-station/station-detail/${station.id}`);
  };

  const loading = loadingStations || loadingCoords;

  return (
    <>
      {showModal && (
        <LocationPermissionModal
          onAllow={handleAllow}
          onDeny={handleDeny}
          loading={loadingCoords}
        />
      )}

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        {/* Search */}
        <div className="mb-10 flex justify-center">
          <div className="flex gap-2 max-w-lg w-full">
            <div className="flex-1">
              <SearchStation />
            </div>
          </div>
        </div>

        {/* Station list */}
        <div className="max-w-5xl mx-auto space-y-6">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-lg bg-gray-200 animate-pulse"
              />
            ))
          ) : filteredStation.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Hiện tại không tìm thấy trạm nào 😢
            </div>
          ) : (
            filteredStation.map((station) => (
              <StationCard
                key={station.id}
                pinAvailable={
                  station.batteries.filter((b) => b.status === "available")
                    .length
                }
                station={station}
                onclick={() => handleViewDetail(station)}
              />
            ))
          )}
        </div>
      </div>

      {/* Nút định vị */}
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
