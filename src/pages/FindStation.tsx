import StationCard from "@/components/StationCard";
import SearchStation from "@/components/SearchStation";
import { use, useEffect, useState } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { MdMyLocation } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";


export default function FindStation() {
  const navigate=useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // state loading
  const location=useLocation();
  const [showModal, setShowModal] = useState(false);
  const [coords, setCoords] = useState<{ lat: Number; lng: number } | null>(
    null
  );
 
  

  //xử lý đống ý truy cập vị trí
  const handleAllow = () => {
    if (!navigator.geolocation) {
      setMessage("Trình duyệt không hỗ trợ định vị!");
      setShowModal(false);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        console.log("Vị trí hiện tại:", latitude, longitude);
        setShowModal(false);
        setLoading(false);
      },
      (error) => {
        alert("Không thể lấy vị trí. Vui lòng thử lại.");
        setShowModal(false);
        setLoading(false);
      }
    );
  };

  const handleDeny = () => {
    setShowModal(false);
  };

  // Khi component mount
  useEffect(() => {
    if (location.state?.openShowModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  //du lieu demo
  const stations = [
    {
      id: "1",
      name: "Trạm Nguyễn Văn Cừ",
      pinAvailable: 5,
      rating: 4.8,
      address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    },
    {
      id: "2",
      name: "Trạm Lê Văn Việt",
      pinAvailable: 2,
      rating: 4.5,
      address: "45 Lê Văn Việt, Quận 9, TP.Thủ Đức",
    },
    {
      id: "3",
      name: "Trạm Cộng Hòa",
      pinAvailable: 8,
      rating: 4.9,
      address: "88 Cộng Hòa, Quận Tân Bình, TP.HCM",
    },
  ];

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
          {stations.map((station) => (
            <StationCard
              key={station.id}
              id={station.id}
              name={station.name}
              pinAvailable={station.pinAvailable}
              rating={station.rating}
              address={station.address}
              sizeClass="w-full max-w-4xl"
            />
          ))}
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
