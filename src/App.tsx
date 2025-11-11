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
import RegisterPassword from "./pages/SetPassword";
import RegisterVehicle from "./pages/RegisterVehicle";
import MyVehicles from "./pages/MyVehicles";

import AdminVehicleManagement from "./pages/AdminVehicleManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminStationManagement from "./pages/AdminStationManagement";
import AdminBatteryTypeManagement from "./pages/AdminBatteryTypeManagement";
import AdminSubscriptionManagement from "./pages/AdminSubscriptionManagement";
import AdminDamageFeeManagement from "./pages/AdminDamageFeeManagement"

import BatteryManagement from "./pages/BatteryManagement";
import StaffBookingManagement from "./pages/StaffBookingManagement";

import AdminLayout from "./layout/AdminLayout";
import ResetPassword from "./pages/ResetPassword";
import BatteryProcess from "./pages/BatteryProcess";
import AdminVehicleModelManagement from "./pages/ManageModels";
import NotificationPage from "./pages/NotificationPage";
import SupportTicketForm from "./pages/SupportTicketForm";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import SupportHistoryPage from "./pages/SupportHistoryPage";

function App() {
  return (
    <>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/verify" element={<OtpVerify />} />
        <Route path="/register/info" element={<RegisterInfo />} />
        <Route path="/register/password" element={<RegisterPassword />} />
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
          <Route
            path="find-station/station-detail/:id"
            element={<StationDetail />}
          />
          <Route path="booking" element={<Booking />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="subscription-packages" element={<Subscription />} />
          <Route path="register-vehicle" element={<RegisterVehicle />} />
          <Route path="my-vehicles" element={<MyVehicles />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="my-subscription-packages" element={<MySubcription />} />
          <Route path="support" element={<SupportTicketForm />} />
          <Route path="support-history" element={<SupportHistoryPage />} />
        </Route>
        {/* === Staff Routes === */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["staff"]}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="manage-battery"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <BatteryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="swap-battery-process/:bookingId"
            element={<BatteryProcess />}
          />
          <Route path="manage-battery" element={<BatteryManagement />} />
          <Route path="manage-booking" element={<StaffBookingManagement />} />
          {/* <Route index element={<StaffDashboard />} />
         
          <Route path="booking" element={<StaffBooking />} />
          <Route path="report" element={<StaffReport />} />
          <Route path="safety" element={<StaffSafety />} /> */}
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="manage-users" element={<AdminUserManagement />} />
          <Route path="manage-stations" element={<AdminStationManagement />} />
          <Route path="manage-vehicles" element={<AdminVehicleManagement />} />
          <Route path="manage-subscription" element={<AdminSubscriptionManagement />} />
          <Route path="damage-fee" element={<AdminDamageFeeManagement />} />

          <Route path="support-tickets" element={<AdminSupportTickets />} />
          <Route
            path="manage-battery"
            element={
              <ProtectedRoute roles={["staff", "admin"]}>
                <BatteryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="battery-types"
            element={<AdminBatteryTypeManagement />}
          />
          <Route
            path="vehicle-models"
            element={<AdminVehicleModelManagement />}
          />
        </Route>

      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}
