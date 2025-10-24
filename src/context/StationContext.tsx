import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // cần import axios riêng để gọi API openrouteservice
import api from "@/lib/api";
import type { Station, StationWithDistance } from "@/types/station";
import type { Battery } from "@/types/battery";

interface StationContextType {
  stations: Station[];
  loading: boolean;
  fetchAllStation: () => Promise<void>;
  getBatteryCountByStatus: (
    stationId: string,
    status: Battery["status"]
  ) => number;
  getStationWithDistance: (
    coords: { lat: number; lng: number },
    stations: Station[]
  ) => Promise<StationWithDistance[]>;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ROUTE_URL = import.meta.env.VITE_OPEN_ROUTE; 
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  //  Lấy danh sách trạm từ API nội bộ
  const fetchAllStation = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stations", { withCredentials: true });
      const data: Station[] = res.data.data.station;
      setStations(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách trạm:", err);
    } finally {
      setLoading(false);
    }
  };

  //  Đếm số pin theo trạng thái
  const getBatteryCountByStatus = (
    stationId: string,
    status: Battery["status"]
  ) => {
    const station = stations.find((s) => s.id === stationId);
    if (!station) return 0;
    return station.batteries.filter((b) => b.status === status).length;
  };

  //  Tính khoảng cách các trạm dựa vào vị trí người dùng
  const getStationWithDistance = async (
    coords: { lat: number; lng: number },
    stations: Station[]
  ): Promise<StationWithDistance[]> => {
    const requests = stations.map(async (station) => {
      try {
        const res = await axios.get(`${ROUTE_URL}/v2/directions/driving-car`, {
          params: {
            start: `${coords.lng},${coords.lat}`,
            end: `${station.longitude},${station.latitude}`,
          },
        });

        const summary = res.data.features[0].properties.summary;
        return {
          ...station,
          distance: summary.distance,
          duration: summary.duration,
        };
      } catch (err) {
        console.error("Lỗi khi tính khoảng cách:", err);
        return {
          ...station,
          distance: Infinity,
          duration: Infinity,
        };
      }
    });

    const results = await Promise.all(requests);
    return results.sort((a, b) => a.distance - b.distance);
  };

  return (
    <StationContext.Provider
      value={{
        stations,
        loading,
        fetchAllStation,
        getBatteryCountByStatus,
        getStationWithDistance,
      }}
    >
      {children}
    </StationContext.Provider>
  );
};

export const useStation = () => {
  const context = useContext(StationContext);
  if (!context)
    throw new Error("useStation must be used within StationProvider");
  return context;
};
