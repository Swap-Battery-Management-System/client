import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StationCardProps {
  id: string;
  name: string;
  pinAvailable: number;
  rating: number;
  address: string;
  sizeClass?: string;
}

export default function StationCard({
  id,
  name,
  pinAvailable,
  rating,
  address,
  sizeClass = "",
}: StationCardProps) {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate(`/thong-tin-tram-chi-tiet/${id}`);
  };

  return (
    <Card
      className={`border-1 border-[#38A3A5] shadow-md hover:shadow-lg transition-all ${sizeClass} mx-auto rounded-none`}
    >
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#38A3A5]">{name}</h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star size={16} />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
          </div>
        </div>

        <div className="text-gray-700 text-sm">
          <p className="font-medium">
            Số pin có sẵn:{" "}
            <span className="text-[#38A3A5]">{pinAvailable}</span>
          </p>
        </div>

        <p className="text-gray-800 font-medium">{address}</p>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full text-[#38A3A5] font-semibold hover:bg-[#e0f7f8]"
          onClick={handleViewMore}
        >
          Xem chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
}
