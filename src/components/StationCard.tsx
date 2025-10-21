import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, MapPin, Clock } from "lucide-react";
import type { Station } from "@/types/station";


type Props = {
  station: Station & {
    distance?: number;
    duration?: number;
  };
  onclick?: () => void;
  sizeClass?: string;
  pinAvailable: number;
};

export default function StationCard({
  station,
  onclick,
  sizeClass,
  pinAvailable,
}: Props) {
  // Chuyển thời gian từ giây sang phút hoặc giờ
  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === Infinity) return "—";
    if (seconds < 60) return `${Math.round(seconds)} giây`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} phút`;
    return `${(seconds / 3600).toFixed(1)} giờ`;
  };

  // Chuyển khoảng cách từ mét sang km
  const formatDistance = (meters?: number) => {
    if (!meters || meters === Infinity) return "—";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  return (
    <Card
      className={`border border-[#38A3A5] shadow-md hover:shadow-lg transition-all ${sizeClass} mx-auto rounded-none`}
    >
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#38A3A5]">{station.name}</h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star size={16} />
            <span className="text-sm font-medium text-gray-700">
              {station.avgRating ?? "—"}
            </span>
          </div>
        </div>

        <div className="text-gray-700 text-sm space-y-1">
          <p>
            <span className="font-medium">Số pin có sẵn:</span>{" "}
            <span className="text-[#38A3A5] font-semibold">{pinAvailable}</span>
          </p>

          {/*khoảng cách và thời gian */}
          {station.distance !== undefined && (
            <p className="flex items-center gap-1">
              <MapPin size={14} className="text-[#38A3A5]" />
              <span>Khoảng cách: {formatDistance(station.distance)}</span>
            </p>
          )}
          {station.duration !== undefined && (
            <p className="flex items-center gap-1">
              <Clock size={14} className="text-[#38A3A5]" />
              <span>Thời gian dự kiến: {formatDuration(station.duration)}</span>
            </p>
          )}
        </div>

        <p className="text-gray-800 font-medium">{station.address}</p>
      </CardContent>

      <CardFooter>
        <button
          onClick={onclick}
          className="text-[#38A3A5] font-semibold hover:text-[#1e6f71] hover:font-bold transition-all duration-200 ml-auto"
        >
          Xem chi tiết
        </button>
      </CardFooter>
    </Card>
  );
}
