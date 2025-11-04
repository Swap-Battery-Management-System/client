import React from "react";
import type { BatteryType } from "@/types/batteryType";
import type { Station } from "@/types/station";
interface NewBattery {
  code: string;
  batteryTypeId: string;
  currentCapacity?: number;
  soc?: number;
  cycleCount?: number;
  status: string;
  stationId: string;
  manufacturedAt: string;
  voltage?: number;
  temperature?: number;
}

interface Props {
  batteryTypes: BatteryType[];
  stations: Station[];
  newBattery: NewBattery;
  setNewBattery: (b: NewBattery) => void;
  handleAddBattery: () => Promise<void> | void;
}

export default function AddBatteryForm({
  batteryTypes,
  stations,
  newBattery,
  setNewBattery,
  handleAddBattery,
}: Props) {
  return (
    <div className="border p-4 rounded-md bg-[#F8FFFD]">
      <h3 className="font-semibold mb-3 text-[#38A3A5]">Thêm pin mới</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã pin
          </label>
          <input
            placeholder="Nhập mã pin"
            value={newBattery.code}
            onChange={(e) =>
              setNewBattery({ ...newBattery, code: e.target.value })
            }
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại pin
          </label>
          <select
            value={newBattery.batteryTypeId}
            onChange={(e) =>
              setNewBattery({ ...newBattery, batteryTypeId: e.target.value })
            }
            className="border rounded px-2 py-1 w-full text-sm"
          >
            <option value="">Chọn loại pin</option>
            {batteryTypes.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voltage (V)
          </label>
          <input
            type="number"
            placeholder="Nhập điện áp"
            value={newBattery.voltage ?? ""}
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              setNewBattery({ ...newBattery, voltage: value });
            }}
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature (°C)
          </label>
          <input
            type="number"
            placeholder="Nhập nhiệt độ"
            value={newBattery.temperature ?? ""}
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              setNewBattery({ ...newBattery, temperature: value });
            }}
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạm
          </label>
          <select
            value={newBattery.stationId}
            onChange={(e) =>
              setNewBattery({ ...newBattery, stationId: e.target.value })
            }
            className="border rounded px-2 py-1 w-full text-sm"
          >
            <option value="">Chọn trạm</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dung lượng hiện tại (mAh)
          </label>
          <input
            type="number"
            placeholder="Nhập số dung lượng"
            value={newBattery.currentCapacity ?? ""}
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              if (value !== undefined && value < 0) return;
              setNewBattery({ ...newBattery, currentCapacity: value });
            }}
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số chu kỳ sạc
          </label>
          <input
            type="number"
            placeholder="Nhập số chu kỳ"
            value={newBattery.cycleCount ?? ""}
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              if (value !== undefined && value < 0) return;
              setNewBattery({ ...newBattery, cycleCount: value });
            }}
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SOC (%)
          </label>
          <input
            type="number"
            placeholder="Nhập SOC (0–100)"
            value={newBattery.soc ?? ""}
            onChange={(e) => {
              const value =
                e.target.value === "" ? undefined : Number(e.target.value);
              if (value !== undefined && (value < 0 || value > 100)) return;
              setNewBattery({ ...newBattery, soc: value });
            }}
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày sản xuất
          </label>
          <input
            type="date"
            max={
              new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0]
            }
            value={newBattery.manufacturedAt}
            onChange={(e) => {
              const selected = e.target.value;
              const today = new Date().toISOString().split("T")[0];
              if (selected > today) {
                alert("Không thể chọn ngày trong tương lai!");
                return;
              }
              setNewBattery({ ...newBattery, manufacturedAt: selected });
            }}
            className="border rounded px-2 py-1 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            value={newBattery.status || "available"}
            onChange={(e) =>
              setNewBattery({ ...newBattery, status: e.target.value })
            }
            className="border rounded px-2 py-1 w-full text-sm"
          >
            <option value="available">available</option>
            <option value="in_use">in_use</option>
            <option value="in_charged">in_charged</option>
            <option value="in_transit">in_transit</option>
            <option value="faulty">faulty</option>
            <option value="reserved">reserved</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          disabled={
            !newBattery.code.trim() ||
            !newBattery.batteryTypeId ||
            !newBattery.stationId ||
            newBattery.currentCapacity === undefined ||
            newBattery.cycleCount === undefined ||
            newBattery.soc === undefined ||
            !newBattery.manufacturedAt
          }
          onClick={() => handleAddBattery()}
          className={`px-4 py-1 rounded text-sm text-white transition ${
            !newBattery.code ||
            !newBattery.batteryTypeId ||
            !newBattery.stationId ||
            newBattery.currentCapacity === undefined ||
            newBattery.cycleCount === undefined ||
            newBattery.soc === undefined ||
            !newBattery.manufacturedAt
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#38A3A5] hover:bg-[#2C7A7B]"
          }`}
        >
          Lưu pin mới
        </button>
      </div>
    </div>
  );
}
