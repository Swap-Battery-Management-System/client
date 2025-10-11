import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import RegisterInfo from "./pages/RegisterInfo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các trang cũ */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Các trang mới trong flow đăng ký */}
        <Route path="/signup" element={<Register />} />
        <Route path="/register/verify" element={<OtpVerify />} />
        <Route path="/register/info" element={<RegisterInfo />} />

        {/* Placeholder nếu cần trang home sau này */}
        <Route path="/home" element={<div>Home page coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

