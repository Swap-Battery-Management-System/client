export type Battery = {
  id: string;
  code: string;
  currentCapacity: number;
  manufacturedAt: string;
  cycleCount: number;
  soc: number;
  status: "available" | "in_use" | "charging" | "faulty"|"in_transit";
  stationId: string;
  batteryTypeId: string;
};