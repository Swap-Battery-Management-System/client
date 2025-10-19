export type Station = {
  id: string;
  name: string;
  slotCapacity:number;
  address: string;
  latitude:number;
  longitude:number;
  status:string;
  avgRating: number|null;
};
