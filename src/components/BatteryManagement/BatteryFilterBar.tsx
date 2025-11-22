import React from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import type { BatteryType } from "@/types/batteryType";
import type { Station } from "@/types/station";

interface Props {
  searchId: string;
  setSearchId: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterStation: string;
  setFilterStation: (v: string) => void;
  batteryTypes: BatteryType[];
  stations: Station[];
  role?: string;
  onClear: () => void;
  onToggleAdd?: () => void;
  showAddForm?: boolean;
}

export default function BatteryFilterBar({
  searchId,
  setSearchId,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterStation,
  setFilterStation,
  batteryTypes,
  stations,
  role,
  onClear,
  onToggleAdd,
  showAddForm,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap p-4">
      <div className="relative flex-1 max-w-xs">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Nhập mã pin..."
          className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-300"
      >
        <option value="">Loại pin</option>
        {batteryTypes.map((bt) => (
          <option key={bt.id} value={bt.name}>
            {bt.name}
          </option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-200"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="available">available</option>
        <option value="in-use">in-use</option>
        <option value="in-charged">in-charged</option>
        <option value="in-transit">in-transit</option>
        <option value="faulty">faulty</option>
        <option value="reserved">reserved</option>
      </select>

      {role === "admin" && (
        <select
          value={filterStation}
          onChange={(e) => setFilterStation(e.target.value)}
          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-200"
        >
          <option value="all">Tất cả trạm</option>
          {stations.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={onClear}
        className="bg-[#38A3A5] text-white px-3 py-1 rounded hover:bg-[#246B45] text-sm"
      >
        Làm mới
      </button>

      {role === "admin" && onToggleAdd && (
        <button
          onClick={onToggleAdd}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
        >
          <FaPlus /> {showAddForm ? "Đóng" : "Thêm pin"}
        </button>
      )}
    </div>
  );
}
