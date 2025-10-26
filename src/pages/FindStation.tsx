import StationCard from "@/components/StationCard";
import SearchStation from "@/components/SearchStation";
import { useEffect, useState } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { MdMyLocation } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import type { Station } from "@/types/station";
import { useStation } from "@/context/StationContext";

export default function FindStation() {
  const navigate = useNavigate();
  const location = useLocation();
  const keyword = (location.state as { keyword?: string })?.keyword || "";

  const [filteredStation, setFilteredStation] = useState<Station[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    () => {
      const saved = localStorage.getItem("userCoords");
      return saved ? JSON.parse(saved) : null;
    }
  );
  const [showModal, setShowModal] = useState(false);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const {
    fetchAllStation,
    stations,
    loading: loadingStations,
    getStationWithDistance,
  } = useStation();

  // Lấy danh sách trạm
  useEffect(() => {
    fetchAllStation();
    const checkPermiss = localStorage.getItem("permissionUserLocation");
    if(checkPermiss==="granted"){
      startWatchingLocation();
    }
  }, []);

  // Lọc theo từ khóa hoặc coords
  useEffect(() => {
    const filterStations = async () => {
      if (keyword.trim()) {
        const filtered = stations.filter(
          (s) =>
            s.name.toLowerCase().includes(keyword.toLowerCase()) ||
            s.address.toLowerCase().includes(keyword.toLowerCase())
        );
        if (coords) {
          const stationWithDistance = await getStationWithDistance(
            coords,
            filtered
          );
          setFilteredStation(stationWithDistance);
        } else {
          setFilteredStation(filtered);
        }
        return;
      } else if (coords) {
        const stationWithDistance = await getStationWithDistance(
          coords,
          stations
        );
        setFilteredStation(stationWithDistance);
        return;
      }
      setFilteredStation(stations);
    };
    filterStations();
  }, [keyword, coords, stations]);

  // Lưu vị trí vào localStorage
  useEffect(() => {
    if (coords) {
      localStorage.setItem("userCoords", JSON.stringify(coords));
    }
  }, [coords]);

  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      setShowModal(false);
      return;
    }

    setLoadingCoords(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        setLoadingCoords(false);
      },
      (error) => {
        console.error("Không thể lấy vị trí", error);
        setLoadingCoords(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  const handleAllow = () => {
    localStorage.setItem("permissionUserLocation", "granted");
    setShowModal(false);
    startWatchingLocation();
  };

  const handleDeny = () => {
    localStorage.setItem("permissionUserLocation", "denied");
    localStorage.setItem("userCoords","");
    setCoords(null);
    setShowModal(false);
  };

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
        {/* Thanh search */}
        <div className="mb-10 flex justify-center">
          <div className="flex gap-2 max-w-lg w-full">
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

      {/* Button định vị */}
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
