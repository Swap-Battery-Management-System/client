import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import RegisterInfo from "./pages/RegisterInfo";
import Landing from "./pages/Landing";
import Layout from "./layout/layout";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import BookingHistory from "./pages/BookingHistory";
import Subscription from "./pages/Subcription";
import MySubcription from "./pages/MySubcription";

function App() {
  return (
    <>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<Landing />} />
        <Route path="/dang-nhap" element={<Login />} />

        <Route path="/dang-ki" element={<Register />} />
        <Route path="/dang-ki/xac-thuc" element={<OtpVerify />} />
        <Route path="/dang-ki/thong-tin" element={<RegisterInfo />} />

        <Route path="/goi-cua-toi" element={< MySubcription />} />

        <Route path="/dat-lich" element={<Navigate to="/trang-chu/dat-lich" />} />
        <Route path="/lich-su-dat-lich" element={<Navigate to="/trang-chu/lich-su-dat-lich" />} />
        <Route path="/goi-thue-bao" element={<Navigate to="/trang-chu/goi-thue-bao" />} />


        <Route path="/trang-chu" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dat-lich" element={<Booking />} />
          <Route path="lich-su-dat-lich" element={<BookingHistory />} />
          <Route path="goi-thue-bao" element={<Subscription />} />
          {/* <Route path="thong-tin-ca-nhan" element={<ThongTinCaNhan />} />
          <Route path="phuong-tien-cua-toi" element={<PhuongTienCuaToi />} />
          <Route path="cai-dat-bao-mat" element={<CaiDatBaoMat />} />
          <Route path="tim-tram" element={<TimTram />} />
          <Route path="dat-lich" element={<DatLich />} />
          <Route path="lich-su-dat-lich" element={<LichSuDoiPin />} />
          <Route path="goi-thue-bao" element={<GoiThueBao />} />
          <Route path="bang-phi" element={<BangPhi />} />
          <Route path="lich-su-thanh-toan" element={<LichSuThanhToan />} />
          <Route path="bao-cao" element={<BaoCao />} /> 
          <Route path="dang-xuat" element={<BaoCao />}*/}
        </Route>
      </Routes>
    </>
  );
}

export default App;

