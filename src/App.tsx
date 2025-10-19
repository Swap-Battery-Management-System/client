import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import RegisterInfo from "./pages/RegisterInfo";
// import RegisterLayout from "./layout/RegisterLayout";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";

import { ProtectedRoute } from "./components/ProtectedRoute";


import StaffLayout from "./layout/StaffLayout";
import Landing from "./pages/Landing";
import Layout from "./layout/layout";
import Home from "./pages/Home";
import FindStation from "./pages/FindStation";
import StationDetail from "./pages/StationDetail";
import Booking from "./pages/Booking";
import BookingHistory from "./pages/BookingHistory";
import Subscription from "./pages/Subcription";
import MySubcription from "./pages/MySubcription";
import RegisterPassword from "./pages/RegisterPassword";

import AdminVehicleManagement from "./pages/AdminVehicleManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminStationManagement from "./pages/AdminStationManageMent";

import BatteryManagement from "./pages/BatteryManagement";
import AdminLayout from "./layout/AdminLayout";

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
        <Route path="/register/password" element={<RegisterPassword />} />
        {/* Layout người dùng */}
        <Route
          path="/home"
          element={
            // <ProtectedRoute roles={["driver"]}>
            <Layout />
            // </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="find-station" element={<FindStation />} />
          <Route
            path="find-station/station-detail"
            element={<StationDetail />}
          />
          <Route path="booking" element={<Booking />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="subscription-packages" element={<Subscription />} />

          {/* <Route path="thong-tin-ca-nhan" element={<ThongTinCaNhan />} />
          <Route path="phuong-tien-cua-toi" element={<PhuongTienCuaToi />} />
          <Route path="cai-dat-bao-mat" element={<CaiDatBaoMat />} /> 
          
          
          <Route path="bang-phi" element={<BangPhi />} />
          <Route path="lich-su-thanh-toan" element={<LichSuThanhToan />} />
          <Route path="bao-cao" element={<BaoCao />} /> 
          <Route path="dang-xu" element={<BaoCao />}*/}
        </Route>
        //can fix lai
        <Route path="my-subscription-packages" element={<MySubcription />} />
        {/* === Staff Routes === */}
        <Route
          path="/staff"
          element={
            // <ProtectedRoute roles={["staff"]}>
            <StaffLayout />
            // </ProtectedRoute>
          }
        >
          <Route path="manage-battery" element={<BatteryManagement />} />
          {/* <Route index element={<StaffDashboard />} />
         
          <Route path="booking" element={<StaffBooking />} />
          <Route path="report" element={<StaffReport />} />
          <Route path="safety" element={<StaffSafety />} /> */}
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="manage-users" element={<AdminUserManagement />} />
          <Route path="manage-stations" element={<AdminStationManagement />} />
          <Route path="manage-vehicles" element={<AdminVehicleManagement />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
