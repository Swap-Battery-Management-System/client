import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchStation() {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (keyword.trim()) {
      console.log("Tìm trạm:", keyword);
      // TODO: Gọi API hoặc điều hướng đến trang kết quả
    }
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
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập vị trí để tìm trạm đổi pin gần nhất..."
        className="w-full pl-12 pr-28 py-4 rounded-full text-gray-700 placeholder-gray-400 shadow-lg border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-300/40 focus:outline-none transition-all duration-300 bg-white backdrop-blur-sm"
      />

      {/* Nút tìm */}
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
      >
        Tìm
      </button>
    </div>
  );
}
