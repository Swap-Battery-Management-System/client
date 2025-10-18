import { useState } from "react";

type Station = {
  id: string;
  name: string;
  pinAvailable: number;
  rating: number;
  address: string;
  lat: number;
  lng: number;
};

export default function StationDetail() {
  const [station] = useState<Station>({
    id: "1",
    name: "Trạm Nguyễn Văn Cừ",
    pinAvailable: 5,
    rating: 4.8,
    address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    lat: 10.757375,
    lng: 106.684611,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Map phía trên */}
      <div className="w-full h-64 md:h-96 bg-gray-200 relative rounded-b-lg overflow-hidden">
        <div className="w-full h-64 md:h-96 bg-gray-200 relative rounded-b-lg overflow-hidden">
          <iframe
            title="Google Map Directions"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?saddr=My+Location&daddr=${station.lat},${station.lng}&hl=vi&output=embed`}
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`
              )
            }
            className="px-6 py-2 bg-[#38A3A5] text-white font-semibold rounded-lg hover:bg-[#2e827f] transition-colors"
          >
            Mở trong Google Maps
          </button>
        </div>
      </div>

      {/* Box thông tin trạm */}
      <div className="flex-1 p-6 mt-6">
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h1 className="text-2xl font-bold">{station.name}</h1>
          <p className="text-gray-700">Địa chỉ: {station.address}</p>
          <p className="text-gray-700">Pin khả dụng: {station.pinAvailable}</p>
          <p className="text-gray-700">Đánh giá: {station.rating} ⭐</p>

          {/* Nút đặt lịch góc phải */}
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-[#38A3A5] text-white font-semibold rounded-lg hover:bg-[#2e827f] transition-colors">
              Đặt lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
