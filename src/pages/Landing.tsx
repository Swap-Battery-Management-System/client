import { Button } from "../components/ui/button";
import landingImage from "../assets/images/landing-image.jpg";
import { Card, CardContent } from "../components/ui/card";
import {
  Battery,
  MapPin,
  Calendar,
  Bell,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "../components/Footer";
import { useNavigate } from "react-router-dom";


function App() {
  const navigate = useNavigate();
  const handleLogin = () => navigate("/login");
  const { user, initialized } = useAuth();

  // useEffect(() => {
  //   if (initialized && user) {
  //     const timer = setTimeout(() => {
  //       switch (user.role) {
  //         case "admin":
  //           navigate("/admin", { replace: true });
  //           break;
  //         case "staff":
  //           navigate("/moderator", { replace: true });
  //           break;
  //         case "driver":
  //           navigate("/home", { replace: true });
  //           break;
  //         default:
  //           navigate("/", { replace: true });
  //       }
  //     }, 300); // delay 200ms để DOM kịp render

  //     return () => clearTimeout(timer); // cleanup
  //   }
  // }, [user, initialized, navigate]);

  const handleSignUp = () => navigate("/register");
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 text-[#2F3E46]">
      {/* HÌNH TRÒN LỚN */}
      <div className="absolute top-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-[#38A3A5]/30 rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

      {/* HÌNH TRÒN NHỎ 1 */}
      <div className="absolute top-20 left-10 w-10 h-10 bg-[#38A3A5]/40 rounded-full pointer-events-none"></div>

      {/* HÌNH TRÒN NHỎ 2 */}
      <div className="absolute top-40 right-20 w-14 h-14 bg-[#38A3A5]/20 rounded-full pointer-events-none"></div>

      {/* HÌNH TRÒN NHỎ 3 */}
      <div className="absolute bottom-10 left-32 w-12 h-12 bg-[#38A3A5]/25 rounded-full pointer-events-none"></div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 flex justify-between items-center py-4 px-8 bg-white/70 backdrop-blur-md shadow-sm border-b border-[#57CC99]/30">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#2F3E46]">
          <span className="text-[#38A3A5] text-xl">⚡</span> SwapNet
        </div>
        <nav className="flex items-center gap-6 text-[#2F3E46]/80">
          <a href="#home" className="hover:text-[#38A3A5] transition">
            Home
          </a>
          <a href="#about" className="hover:text-[#38A3A5] transition">
            About
          </a>
          <a href="#" className="hover:text-[#38A3A5] transition">
            Stations
          </a>
          <div className="flex gap-2">
            <Button
              onClick={handleLogin}
              variant="ghost"
              className="text-[#2F3E46] hover:text-white hover:bg-[#57CC99] transition"
            >
              Login
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-[#57CC99] hover:bg-[#48B89F] text-white shadow-md transition"
            >
              Sign Up
            </Button>
          </div>
        </nav>
      </header>

      {/* ===== HERO SECTION ===== */}
      <main
        id="home"
        className="flex-grow flex flex-col md:flex-row items-center justify-between px-6 lg:px-16 py-20 max-w-6xl mx-auto"
      >
        {/* LEFT: TEXT */}
        <div className="md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2F3E46] leading-snug">
            Giải pháp đổi pin xe điện{" "}
            <span className="text-[#38A3A5]">
              nhanh chóng, tiện lợi và thông minh.
            </span>
          </h1>

          <p className="text-[#2F3E46]/80 text-lg max-w-md mx-auto md:mx-0">
            Hệ thống quản lý trạm đổi pin giúp bạn theo dõi trạng thái pin, đặt
            lịch đổi và tìm trạm gần nhất chỉ trong vài giây.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              onClick={handleLogin}
              className="bg-[#57CC99] hover:bg-[#48B89F] text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>

        {/* RIGHT: IMAGE */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src={landingImage}
            alt="EV Battery Swap"
            className="w-80 md:w-[420px] drop-shadow-xl"
          />
        </div>
      </main>

      {/* ===== FEATURES SECTION ===== */}
      <section
        id="about"
        className="bg-white/90 py-16 border-t border-[#57CC99]/20"
      >
        <div className="max-w-6xl mx-auto px-6 text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#38A3A5] mb-3">
            Tính năng nổi bật
          </h2>
          <p className="text-[#52796F] max-w-2xl mx-auto">
            Khám phá hệ thống đổi pin thông minh, đồng bộ và thân thiện với môi
            trường.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-3 max-w-6xl mx-auto px-6">
          {[
            {
              icon: <Battery className="text-[#38A3A5] text-3xl" />,
              title: "Quản lý pin và trạm đổi",
              desc: "Theo dõi tình trạng pin và vị trí trạm dễ dàng.",
            },
            {
              icon: <MapPin className="text-[#38A3A5] text-3xl" />,
              title: "Tìm trạm đổi pin gần nhất",
              desc: "Xem bản đồ và chọn trạm phù hợp với bạn.",
            },
            {
              icon: <Calendar className="text-[#38A3A5] text-3xl" />,
              title: "Đặt lịch đổi pin nhanh",
              desc: "Tiết kiệm thời gian với tính năng đặt lịch.",
            },
            {
              icon: <Bell className="text-[#38A3A5] text-3xl" />,
              title: "Thông báo tức thì",
              desc: "Nhận thông báo khi pin gần hết hoặc khi có trạm đổi pin trống gần bạn.",
            },
            {
              icon: <BarChart3 className="text-[#38A3A5] text-3xl" />,
              title: "Thống kê và báo cáo",
              desc: "Xem thống kê chi tiết về mức tiêu thụ pin, quãng đường di chuyển và chi phí sử dụng.",
            },
            {
              icon: <ShieldCheck className="text-[#38A3A5] text-3xl" />,
              title: "An toàn & bảo mật",
              desc: "Mọi dữ liệu người dùng được mã hóa, đảm bảo quyền riêng tư và an toàn tuyệt đối.",
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="p-6 hover:shadow-lg border border-[#57CC99]/20 transition rounded-2xl bg-white"
            >
              <CardContent className="flex flex-col items-center text-center space-y-3">
                {item.icon}
                <h3 className="font-semibold text-[#2F3E46]">{item.title}</h3>
                <p className="text-[#2F3E46]/70 text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}

export default App;
