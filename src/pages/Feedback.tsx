import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

export default function Feedback() {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
 const [station, setStation] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load booking & station info from invoiceId
  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      toast.error("Không tìm thấy invoiceId");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Lấy invoice để lấy bookingId
        const invoiceRes = await api.get(`/invoices/${invoiceId}`);
        const invoice = invoiceRes.data?.data?.invoice;

        if (!invoice?.bookingId) throw new Error("Không tìm thấy bookingId");

        setBookingId(invoice.bookingId);

        // 2. Lấy booking
        const bookingRes = await api.get(`/bookings/${invoice.bookingId}`);
        const booking =
          bookingRes.data?.data?.booking ||
          bookingRes.data?.data?.bookings?.[0];

        if (!booking?.stationId) throw new Error("Không tìm thấy stationId");

        // 3. Lấy station
        const stationRes = await api.get(`/stations/${booking.stationId}`);
        const station = stationRes.data?.data?.station;

        if (station?.name) setStation(station);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  const handleSubmit = async () => {
    if (!rating) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    console.log("rating", rating);

    try {
      setSubmitting(true);

      await api.post("/feedbacks", {
        invoiceId,
        rating,
        stationId:station.id,
        comment,
      });

      toast.success("Cảm ơn bạn đã đánh giá ❤️");
      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      toast.error("Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin w-10 h-10 text-[#38A3A5]" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-lg rounded-2xl shadow-md">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-xl font-semibold text-center">
            Đánh giá dịch vụ
          </h1>

          <p className="text-center text-gray-600">
            Trạm: <span className="font-medium">{station?.name}</span>
          </p>

          {/* Rating Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer w-8 h-8 transition ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate("/home")}>
              Bỏ qua
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#38A3A5] hover:bg-[#2D8688] text-white gap-2"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
