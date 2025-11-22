import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import type { Battery } from "@/types/battery";
import type { BatteryType } from "@/types/batteryType";
import type { Station } from "@/types/station";

interface Props {
  currentPageData: Battery[];
  page: number;
  ITEMS_PER_PAGE: number;
  editingBattery: Battery | null;
  setEditingBattery: (b: Battery | null) => void;
  batteryTypes: BatteryType[];
  stations: Station[];
  stationMap: Record<string, string>;
  getStatusColor: (s: string) => string;
  role?: string;
  handleSave: () => Promise<void> | void;
  handleDelete: (id: string) => Promise<void> | void;
  markFaulty: (id: string) => Promise<void> | void;
}

export default function BatteryTable({
  currentPageData,
  page,
  ITEMS_PER_PAGE,
  editingBattery,
  setEditingBattery,
  batteryTypes,
  stations,
  stationMap,
  getStatusColor,
  role,
  handleSave,
  handleDelete,
  markFaulty,
}: Props) {
  // no expanded/detail row anymore

  return (
    <>
      <p className="text-gray-600 text-right">
        Tổng số pin:{" "}
        <span className="font-medium text-[#38A3A5] ">
          {currentPageData.length}
        </span>
      </p>

      <table className="min-w-full table-auto text-center border-collapse">
        <thead className="bg-[#E6F7F7] text-[#38A3A5]">
          <tr>
            {[
              "STT",
              "Mã Pin",
              "Loại Pin",
              "Dung lượng",
              "SoC",
              "Chu kỳ",
              "Voltage",
              "Temp",
              "Trạng thái",
              "Trạm",
              "Ngày SX",
              "Hành động",
            ].map((h) => (
              <th key={h} className="border px-2 py-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((pin, idx) => {
            const isEditing = editingBattery?.id === pin.id;
            const date = pin.manufacturedAt?.split("T")[0];

            return (
              <React.Fragment key={pin.id}>
                <tr className="border-b hover:bg-gray-100">
                  <td>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>

                  <td>
                    {isEditing ? (
                      <input
                        value={editingBattery!.code}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            code: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-24 text-sm"
                      />
                    ) : (
                      pin.code
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editingBattery!.batteryType?.id || ""}
                        onChange={(e) => {
                          const selected = batteryTypes.find(
                            (bt) => bt.id === e.target.value
                          );
                          if (selected)
                            setEditingBattery({
                              ...(editingBattery as any),
                              batteryType: selected,
                            });
                        }}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {batteryTypes.map((bt) => (
                          <option key={bt.id} value={bt.id}>
                            {bt.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      pin.batteryType?.name
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={editingBattery!.currentCapacity}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            currentCapacity: Number(e.target.value),
                          })
                        }
                        className="border rounded px-2 py-1 w-24 text-sm"
                      />
                    ) : (
                      pin.currentCapacity
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingBattery!.soc}
                        min={0}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            soc: Number(e.target.value),
                          })
                        }
                        className="border rounded px-2 py-1 w-16 text-sm"
                      />
                    ) : (
                      `${pin.soc}%`
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={editingBattery!.cycleCount}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            cycleCount: Number(e.target.value),
                          })
                        }
                        className="border rounded px-2 py-1 w-16 text-sm"
                      />
                    ) : (
                      pin.cycleCount
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingBattery!.voltage ?? ""}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            voltage:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="border rounded px-2 py-1 w-20 text-sm"
                      />
                    ) : (
                      pin.voltage ?? "-"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingBattery!.temperature ?? ""}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            temperature:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                        className="border rounded px-2 py-1 w-20 text-sm"
                      />
                    ) : (
                      pin.temperature ?? "-"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      (() => {
                        const current = editingBattery!.status;
                        const allowedTransitions: Record<string, string[]> = {
                          available: [
                            "in_use",
                            "in_transit",
                            "faulty",
                            "reserved",
                          ],
                          in_use: ["in_charged", "faulty"],
                          in_charged: ["available", "faulty"],
                          in_transit: ["available", "faulty"],
                          faulty: ["available"],
                          reserved: ["available", "in_use", "faulty"],
                        };
                        const allowedStatuses = [
                          current,
                          ...(allowedTransitions[current] || []),
                        ].filter((v, i, a) => a.indexOf(v) === i);

                        return (
                          <select
                            value={editingBattery!.status}
                            onChange={(e) =>
                              setEditingBattery({
                                ...(editingBattery as any),
                                status: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          >
                            {allowedStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        );
                      })()
                    ) : (
                      <span className={getStatusColor(pin.status)}>
                        {pin.status}
                      </span>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editingBattery!.stationId}
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            stationId: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {stations.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      stationMap[pin.stationId] || "Không xác định"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          editingBattery!.manufacturedAt
                            ? editingBattery!.manufacturedAt.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setEditingBattery({
                            ...(editingBattery as any),
                            manufacturedAt: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      date
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 flex items-center gap-1"
                        >
                          <FaSave /> Lưu
                        </button>
                        <button
                          onClick={() => setEditingBattery(null)}
                          className="text-gray-500 flex items-center gap-1"
                        >
                          <FaTimes /> Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        {role === "admin" ||
                          (role === "manager" && (
                            <>
                              <button
                                onClick={() => setEditingBattery(pin)}
                                className="text-blue-500 flex items-center gap-1"
                              >
                                <FaEdit /> Sửa
                              </button>
                            </>
                          ))}
                        {pin.id && role==="admin" && (
                          <button
                            onClick={() => handleDelete(pin.id as string)}
                            className="text-red-600 flex items-center gap-1"
                          >
                            <FaTrash /> Xóa
                          </button>
                        )}
                        {role === "staff" &&
                          pin.id &&
                          pin.status != "faulty" && (
                            <button
                              onClick={() => markFaulty(pin.id as string)}
                              className="text-orange-500 flex items-center gap-1"
                            >
                              <FaTimes /> Đánh dấu lỗi
                            </button>
                          )}
                      </div>
                    )}
                  </td>
                </tr>

              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
