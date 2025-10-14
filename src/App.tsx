import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import RegisterInfo from "./pages/RegisterInfo";
// import RegisterLayout from "./layout/RegisterLayout";
import { Route, Routes } from "react-router";
import Landing from "./pages/Landing";
import Layout from "./layout/layout";
import Home from "./pages/Home";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/verify" element={<OtpVerify />} />
        <Route path="/register/info" element={<RegisterInfo />} />
        {/* Layout người dùng */}
        <Route
          path="/home"
          element={
            <ProtectedRoute roles={["driver"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
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
          <Route path="dang-xu" element={<BaoCao />}*/}
        </Route>
      </Routes>
    </>
  );
}

export default App;
