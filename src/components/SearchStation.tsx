import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

type Station = {
  id: string;
  name: string;
  address: string;
};

export default function SearchStation() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gọi API lấy tất cả trạm
  const fetchAllStation = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stations", { withCredentials: true });
      const data = res.data.data;
      const stationArray = Array.isArray(data.stations)
        ? data.stations
        : [data.stations];
      setStations(stationArray);
      console.log("Fetched stations:", stationArray);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách trạm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStation();
  }, []);

  // Khi người dùng nhập
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
      const filtered = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(value.toLowerCase()) ||
          s.address.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  //Khi nhấn nút tìm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    navigate("/home/find-station", { state: { keyword: input.trim() } });
    setSuggestions([]);
  };

  //Khi chọn gợi ý
  const handleSelectSuggestion = (station: Station) => {
    setInput(station.name);
    setSuggestions([]);
    navigate("/home/find-station", { state: { keyword: station.name } });
  };

  return (
    <div className="relative w-full max-w-lg mx-auto z-20">
      {/* Icon search */}
      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500"
        size={22}
      />

      {/* Ô nhập */}
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Nhập vị trí để tìm trạm đổi pin gần nhất..."
        className="w-full pl-12 pr-28 py-4 rounded-full text-gray-700 placeholder-gray-400 shadow-lg border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-300/40 focus:outline-none transition-all duration-300 bg-white backdrop-blur-sm"
      />

      {/* Nút tìm */}
      <button
        onClick={handleSearch}
        className={`absolute right-2 top-1/2 -translate-y-1/2 font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300 ${"bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white hover:shadow-lg"}`}
      >
        Tìm
      </button>

      {/* Danh sách gợi ý */}
      {suggestions.length > 0 && (
        <ul className="absolute w-full bg-white mt-2 rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-30">
          {suggestions.map((station) => (
            <li
              key={station.id}
              onClick={() => handleSelectSuggestion(station)}
              className="px-4 py-3 hover:bg-teal-50 cursor-pointer transition-colors"
            >
              <p className="font-medium text-gray-700">{station.name}</p>
              <p className="text-sm text-gray-500">{station.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
