import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TryOn from "./pages/TryOn";
import Routine from "./pages/Routine";
import Tracker from "./pages/Tracker";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tryon" element={<TryOn />} />
        <Route path="/routine" element={<Routine />} />
        <Route path="/tracker" element={<Tracker />} />
      </Routes>
    </div>
  );
}

export default App;
