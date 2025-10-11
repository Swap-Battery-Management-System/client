import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import OtpVerify from "./pages/OtpVerify";
import RegisterInfo from "./pages/RegisterInfo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Register />} />
        <Route path="/register/verify" element={<OtpVerify />} />
        <Route path="/register/info" element={<RegisterInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
