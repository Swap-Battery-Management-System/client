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
import FindStation from "./pages/FindStation";
import { Toaster } from "sonner";
import StationDetail from "./pages/StationDetail";
import RegisterVehicle from "./pages/RegisterVehicle";
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
          <Route path="find-station" element={<FindStation />} />
          <Route path="find-station/station-detail" element={<StationDetail />} />
          <Route path="register-vehicle" element={<RegisterVehicle />} />
          {/* <Route path="thong-tin-ca-nhan" element={<ThongTinCaNhan />} />
          <Route path="phuong-tien-cua-toi" element={<PhuongTienCuaToi />} />
          <Route path="cai-dat-bao-mat" element={<CaiDatBaoMat />} />

          <Route path="dat-lich" element={<DatLich />} />
          <Route path="lich-su-doi-pin" element={<LichSuDoiPin />} />
          <Route path="goi-thue-bao" element={<GoiThueBao />} />
          <Route path="bang-phi" element={<BangPhi />} />
          <Route path="lich-su-thanh-toan" element={<LichSuThanhToan />} />
          <Route path="bao-cao" element={<BaoCao />} /> 
          <Route path="dang-xu" element={<BaoCao />}*/}
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
