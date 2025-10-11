import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import RegisterInfo from "./pages/RegisterInfo";
import Landing from "./pages/Landing";
import Layout from "./layout/layout";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Register />} />
        <Route path="/register/verify" element={<OtpVerify />} />
        <Route path="/register/info" element={<RegisterInfo />} />

        {/* Layout người dùng */}
        <Route path="/home" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="thong-tin-ca-nhan" element={<ThongTinCaNhan />} />
          <Route path="phuong-tien-cua-toi" element={<PhuongTienCuaToi />} />
          <Route path="cai-dat-bao-mat" element={<CaiDatBaoMat />} />
          <Route path="tim-tram" element={<TimTram />} />
          <Route path="dat-lich" element={<DatLich />} />
          <Route path="lich-su-doi-pin" element={<LichSuDoiPin />} />
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

