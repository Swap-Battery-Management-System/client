import SearchStation from "@/components/SearchStation";
import StationCard from "@/components/StationCard";
import { Footer } from "@/components/Footer";



export default function Home() {
 
  const stations = [
    {
      id: "S1",
      name: "Trạm 1",
      pinAvailable: 5,
      rating: 4.5,
      address: "123 Đường A",
    },
    {
      id: "S2",
      name: "Trạm 2",
      pinAvailable: 3,
      rating: 4.2,
      address: "456 Đường B",
    },
    {
      id: "S3",
      name: "Trạm 3",
      pinAvailable: 6,
      rating: 4.8,
      address: "789 Đường C",
    },
    {
      id: "S4",
      name: "Trạm 4",
      pinAvailable: 2,
      rating: 4.0,
      address: "321 Đường D",
    },
    {
      id: "S5",
      name: "Trạm 5",
      pinAvailable: 4,
      rating: 4.6,
      address: "654 Đường E",
    },
    {
      id: "S6",
      name: "Trạm 6",
      pinAvailable: 3,
      rating: 4.7,
      address: "987 Đường F",
    },
  ];

  const handleViewTopRated = () => {
    console.log("Xem các trạm được đánh giá cao nhất");
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
      <section className="w-full bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 py-20 px-10 relative overflow-hidden px-50">
        {/* Hiệu ứng ánh sáng mềm */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Tiêu đề nổi bật */}
        <div className="text-center mb-14 relative z-10">
          <h2 className="text-4xl font-extrabold text-teal-700 tracking-wide mb-3 drop-shadow-sm">
            🌱 Các Trạm Nổi Bật 🌱
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá những trạm đổi pin được đánh giá cao nhất — nhanh chóng,
            tiện lợi và thân thiện với môi trường.
          </p>
          <div className="w-28 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grid các thẻ */}
        <div className="grid md:grid-cols-3 gap-3 max-w-6xl mx-auto px-6 relative z-10">
          {stations.map((station) => (
            <StationCard
              station={station}
              sizeClass="w-75 h-50"
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center relative z-10">
          <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-md border border-teal-100 rounded-2xl shadow-md p-10">
            <h3 className="text-2xl font-semibold text-teal-700 mb-3">
              ⚡ Luôn sẵn sàng năng lượng mọi lúc, mọi nơi!
            </h3>
            <p className="text-gray-600 mb-6">
              Hệ thống trạm đổi pin phủ sóng toàn quốc — chỉ cần vài cú chạm là
              bạn có thể tìm thấy trạm gần nhất.
            </p>

            <button
              onClick={handleViewTopRated}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all duration-300"
            >
              Xem thêm các trạm đánh giá cao
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
