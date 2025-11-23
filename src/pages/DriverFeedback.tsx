import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star } from "lucide-react";

interface Feedback {
  id: string;
  comment: string;
  reply?: string;
  rating: number;
  createdAt: string;
  bookingId: string;
  station: {
    id: string;
    name: string;
    address: string;
  };
  invoice: {
    id: string;
  };
}

export default function DriverFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get("/feedbacks");
        const list = res.data?.data?.feedbacks || [];
        console.log("feedback", res.data);
        const sorted = list.sort(
          (a: Feedback, b: Feedback) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setFeedbacks(sorted);
      } catch (error) {
        console.error("Lỗi khi load feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen py-24">
        <Loader2 className="animate-spin w-12 h-12 text-[#38A3A5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] flex flex-col items-center py-12 space-y-6 px-4">
      <h1 className="text-3xl font-extrabold text-[#38A3A5]">
        Tất cả Feedback của bạn
      </h1>

      {feedbacks.length === 0 && (
        <p className="text-gray-500 text-sm text-center">
          Chưa có feedback nào.
        </p>
      )}

      <div className="flex flex-col w-full max-w-4xl gap-6">
        {feedbacks.map((fb) => (
          <Card key={fb.id} className="rounded-2xl shadow-sm bg-white/90">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < fb.rating
                          ? "fill-yellow-400 stroke-yellow-400"
                          : "stroke-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {fb.createdAt.split("T")[0]}{" "}
                  {fb.createdAt.split("T")[1].replace("Z", "")}
                </span>
              </div>

              <p className="text-sm leading-relaxed">{fb.comment}</p>

              {/* Thông tin trạm và booking */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium text-[#38A3A5]">Trạm:</span>{" "}
                  {fb.station.name}
                </p>
                <p>
                  <span className="font-medium text-[#38A3A5]">
                    Mã hóa đơn:
                  </span>{" "}
                  {fb.invoice.id}
                </p>
              </div>

              {fb.reply && (
                <div className="bg-gray-100 p-3 rounded-xl mt-2">
                  <Badge variant="secondary" className="mb-1">
                    Phản hồi từ hệ thống
                  </Badge>
                  <p className="text-sm">{fb.reply}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
