import { BrowserRouter } from "react-router"
import { Route, Routes } from "react-router";
import Landing from "./pages/Landing";

function App() {


  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element=""/>
        <Route path="/signup" element=""/>
        <Route path="/home" element=""/>
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
