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
import AdminDamageFeeManagement from "./pages/AdminDamageFeeManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRevenueManagement from "./pages/AdminRevenueManagement";

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
import SwapSessionManager from "./pages/SwapSessionManagement";
import AdminSupport from "./pages/AdminSupport";
import InvoiceDetail from "./pages/InvoiceDetail";
import PaymentPage from "./pages/PaymentPage";
import InvoiceHistoryPage from "./pages/InvoiceHistoryPage";
import PaymentResult from "./pages/PaymentResult";
import ManagerLayout from "./layout/ManagerLayout";
import DriverFeedback from "./pages/DriverFeedback";
import Feedback from "./pages/Feedback";
import UpdateUserInfo from "./pages/UpdateUserInfo";
import TransactionHistory from "./pages/TransactionHistory";
import StaffDashboard from "./pages/StaffDashboard";
import UserDamageFeeView from "./pages/DamageFee";
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
        <Route path="/invoice-detail" element={<InvoiceDetail />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="payment/result" element={<PaymentResult />} />

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
          <Route path="invoice-history" element={<InvoiceHistoryPage />} />
          <Route path="invoice/:id" element={<InvoiceDetail />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="payment/result" element={<PaymentResult />} />
          <Route path="feedback/:invoiceId" element={<Feedback />} />
          <Route path="my-feedback" element={<DriverFeedback />} />
          <Route path="pricing" element={<UserDamageFeeView />} />
          <Route path="transaction-history" element={<TransactionHistory />} />
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
          <Route index element={<StaffDashboard />} />
          <Route path="manage-battery" element={<BatteryManagement />} />
          <Route path="battery-process">
            <Route path="booking/:bookingId" element={<BatteryProcess />} />
            <Route path="swap/:swapSessionId" element={<BatteryProcess />} />
          </Route>
          <Route path="walkin-swap" element={<BatteryProcess />} />
          <Route path="swap-session" element={<SwapSessionManager />} />
          <Route path="manage-booking" element={<StaffBookingManagement />} />
          <Route path="support" element={<SupportTicketForm />} />
          <Route path="support-history" element={<SupportHistoryPage />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="support" element={<SupportTicketForm />} />
          <Route path="support-history" element={<SupportHistoryPage />} />
          <Route path="profile" element={<UpdateUserInfo />} />
          <Route path="manage-users" element={<AdminUserManagement />} />
          <Route path="manage-stations" element={<AdminStationManagement />} />
          <Route path="manage-vehicles" element={<AdminVehicleManagement />} />
          <Route path="revenue-reports" element={<AdminRevenueManagement />} />
          <Route path="support" element={<SupportTicketForm />} />
          <Route path="support-history" element={<SupportHistoryPage />} />
          <Route
            path="manage-subscription"
            element={<AdminSubscriptionManagement />}
          />
          <Route path="damage-fee" element={<AdminDamageFeeManagement />} />
          <Route path="support-tickets" element={<AdminSupportTickets />} />
          <Route path="support" element={<AdminSupport />} />
          <Route
            path="battery-types"
            element={<AdminBatteryTypeManagement />}
          />
          <Route
            path="vehicle-models"
            element={<AdminVehicleModelManagement />}
          />
          <Route path="manage-battery" element={<BatteryManagement />} />
          <Route path="profile" element={<UpdateUserInfo />} />
          <Route path="manage-booking" element={<StaffBookingManagement />} />
        </Route>

        {/* === Manager Routes === */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={["manager"]}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<StaffDashboard />} />
          <Route path="manage-users" element={<AdminUserManagement />} />
          <Route path="manage-battery" element={<BatteryManagement />} />
          <Route path="manage-booking" element={<StaffBookingManagement />} />
          <Route path="swap-session" element={<SwapSessionManager />} />
          <Route
            path="manage-subscription"
            element={<AdminSubscriptionManagement />}
          />
          <Route path="damage-fee" element={<AdminDamageFeeManagement />} />
          <Route path="support-tickets" element={<AdminSupportTickets />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route
            path="manage-subscription"
            element={<AdminSubscriptionManagement />}
          />
          <Route path="damage-fee" element={<AdminDamageFeeManagement />} />
          <Route path="manage-users" element={<AdminUserManagement />} />
          <Route path="profile" element={<UpdateUserInfo />} />
          <Route path="support" element={<SupportTicketForm />} />
          <Route path="support-history" element={<SupportHistoryPage />} />

          {/* Staff components */}
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
