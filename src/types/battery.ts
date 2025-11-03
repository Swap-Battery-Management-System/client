export type Battery = {
  id?: string;
  code: string;
  currentCapacity: number;
  manufacturedAt: string;
  cycleCount: number;
  soc: number;
  voltage?: number;
  temperature?: number;
  status: string;
  stationId: string;
  batteryTypeId: string;
  batteryType?: {
    id: string;
    name: string;
  };
};