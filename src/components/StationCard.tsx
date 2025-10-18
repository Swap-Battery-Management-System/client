import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

interface StationCardProps {
  id: string;
  name: string;
  pinAvailable: number;
  rating: number;
  address: string;
  coords?: { lat: number; lng: number } | null;
}

type Props = {
  station: StationCardProps;
  onclick?: () => void;
  sizeClass?: string;
};
export default function StationCard({ station, onclick, sizeClass }: Props) {
  const navigate = useNavigate();


  return (
    <Card
      className={`border-1 border-[#38A3A5] shadow-md hover:shadow-lg transition-all ${sizeClass} mx-auto rounded-none`}
    >
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#38A3A5]">{station.name}</h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star size={16} />
            <span className="text-sm font-medium text-gray-700">{station.rating}</span>
          </div>
        </div>

        <div className="text-gray-700 text-sm">
          <p className="font-medium">
            Số pin có sẵn:{" "}
            <span className="text-[#38A3A5]">{station.pinAvailable}</span>
          </p>
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
