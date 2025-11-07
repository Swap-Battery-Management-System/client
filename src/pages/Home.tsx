import SearchStation from "@/components/SearchStation";
import StationCard from "@/components/StationCard";
import { Footer } from "@/components/Footer";
import type { Station } from "@/types/station";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStation } from "@/context/StationContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { fetchAllStation, stations, loading } = useStation();

  //lấy danh sách trạm
  useEffect(() => {
    fetchAllStation();
  }, []);

  const handleViewDetail = (station: Station) => {
    navigate(`/home/find-station/station-detail/${station.id}`);
  };

  const handleViewStation = () => {
    navigate(`/home/find-station`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className=" relative flex flex-col items-center justify-center min-h-[85vh] overflow-hidden bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 text-white">
        {/* Hiệu ứng phủ sáng làm dịu nền */}
        <div className="absolute inset-0 bg-white/15 backdrop-blur-[2px]"></div>

        {/* Hiệu ứng ánh sáng mềm ở góc */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-200/20 blur-[100px] rounded-full"></div>

        {/* Nội dung chính */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight drop-shadow-xl">
            Tìm trạm đổi pin gần bạn nhất ⚡
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-10">
            Nhanh chóng – Thuận tiện – Thân thiện với môi trường 🌿
          </p>

          {/* Thanh tìm kiếm */}
          <div className="w-full max-w-lg mx-auto">
            <SearchStation />
          </div>
        </div>

        {/* Wave separator tạo cảm giác liền mạch */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,192L80,186.7C160,181,320,171,480,170.7C640,171,800,181,960,197.3C1120,213,1280,235,1360,245.3L1440,256V320H0Z"
          ></path>
        </svg>
      </section>

      {/* Station Section */}
      <section className="w-full bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 py-20 px-6 md:px-12 relative overflow-hidden">
        {/* Hiệu ứng ánh sáng mềm */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.5)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Tiêu đề nổi bật */}
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-teal-700 tracking-wide mb-3 drop-shadow-sm">
            🌱 Các Trạm Nổi Bật 🌱
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Khám phá những trạm đổi pin được đánh giá cao nhất — nhanh chóng,
            tiện lợi và thân thiện với môi trường.
          </p>
          <div className="w-28 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 mx-auto mt-5 rounded-full"></div>
        </div>

        {/* Grid các thẻ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              pinAvailable={
                station.batteries.filter((b) => b.status === "available").length
              }
              onclick={() => handleViewDetail(station)}
              sizeClass="w-full aspect-[4/3]" // Giữ tỉ lệ đồng đều, responsive
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center relative z-10">
          <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md border border-teal-100 rounded-2xl shadow-md p-8 md:p-10">
            <h3 className="text-2xl md:text-3xl font-semibold text-teal-700 mb-4">
              ⚡ Luôn sẵn sàng năng lượng mọi lúc, mọi nơi!
            </h3>
            <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
              Hệ thống trạm đổi pin phủ sóng toàn quốc — chỉ cần vài cú chạm là
              bạn có thể tìm thấy trạm gần nhất.
            </p>

            <button
              onClick={handleViewStation}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all duration-300"
            >
              Xem thêm các trạm khác
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
