export type BatteryType= {
  id: string,         // id của loại pin, ví dụ "d909dbfd-411e-4e3e-95a4-3c38e8825f71"
  name: string,        // tên loại pin, ví dụ "Lithium-ion 60V 20Ah"
  designCapacity: number, // dung lượng thiết kế, ví dụ 1200
  price: number,       // giá tiền
  createdAt?: string,   // thời gian tạo
};
