import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface BookingForm {
  userName: string;
  station: string;
  vehicleType: string;
  batteryType: string;
  date: string;
  time: string;
  description: string;
}

export default function Booking() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);


  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Ngày min và max (yyyy-mm-dd cho input type="date")
  const minDate = now.toISOString().split("T")[0];
  const maxDate = in24h.toISOString().split("T")[0];

  // Giờ min và max (HH:mm cho input type="time")
  const pad = (n: number) => n.toString().padStart(2, "0");

  const minTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const maxTime = "23:59"


  const [form, setForm] = useState<BookingForm>({
    userName: "",
    station: "",
    vehicleType: "",
    batteryType: "",
    date: "",
    time: "",
    description: "",
  });


  const handleSelectChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { station, vehicleType, batteryType, date, time } = form;

    if (!station || !vehicleType || !batteryType || !date || !time) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const selected = new Date(`${form.date}T${form.time}`);
    if (selected < now || selected > in24h) {
      alert("Vui lòng chọn ngày giờ trong vòng 24 giờ!");
      return;
    }

    // TODO: validate date + time trong 24h nếu cần

    console.log("Booking submitted:", form);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-purple-100 animate-gradientSlow flex items-start py-12">
      <div className="container mx-auto p-4 flex justify-center">
        <Card className="p-8 w-2/3 max-w-md mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-2xl rounded-3xl border border-blue-100 animate-fadeIn">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
            Đặt lịch
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 1. Tên người dùng (readonly) */}
            <div>
              <Label className="mb-2 block" htmlFor="userName">Tên người dùng</Label>
              <Input
                id="userName"
                name="userName"
                value={form.userName}
                disabled
                className="bg-gray-200"
              />
            </div>

            {/* 2. Tên trạm */}
            <div>
              <Label className="mb-2 block">Tên trạm</Label>

              <div className="relative">
                <Select onValueChange={(value) => handleSelectChange("station", value)}>
                  <SelectTrigger className="w-full pr-10"> {/* chừa chỗ cho nút */}
                    <SelectValue placeholder="Chọn trạm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trạm 1">Trạm 1</SelectItem>
                    <SelectItem value="Trạm 2">Trạm 2</SelectItem>
                    <SelectItem value="Trạm 3">Trạm 3</SelectItem>
                  </SelectContent>
                </Select>

                {/* Nút Google Map nằm bên trong khung */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600"
                  onClick={() => window.open("https://www.google.com/maps", "_blank")}
                >
                  <MapPin className="w-5 h-5" />
                </Button>
              </div>
            </div>


            {/* 3. Loại xe */}
            <div>
              <Label className="mb-2 block">Loại xe</Label>
              <Select
                onValueChange={(value) => handleSelectChange("vehicleType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Xe máy điện">Xe máy điện</SelectItem>
                  <SelectItem value="Ô tô điện">Ô tô điện</SelectItem>
                  <SelectItem value="Xe đạp điện">Xe đạp điện</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Loại pin */}
            <div>
              <Label className="mb-2 block">Loại pin</Label>
              <Select
                onValueChange={(value) => handleSelectChange("batteryType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại pin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pin 48V">Pin 48V</SelectItem>
                  <SelectItem value="Pin 60V">Pin 60V</SelectItem>
                  <SelectItem value="Pin 72V">Pin 72V</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div>
              <Label className="mb-2 block">Ngày</Label>
              <Input
                type="date"
                name="date"
                value={form.date}
                min={minDate}
                max={maxDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="mb-2 block">Giờ</Label>
              <Input
                type="time"
                name="time"
                value={form.time}
                min={form.date === minDate ? minTime : "00:00"}
                max={form.date === maxDate ? maxTime : "23:59"}
                onChange={handleChange}
              />
            </div>




            {/* 7. Ghi chú (optional) */}
            <div>
              <Label className="mb-2 block" htmlFor="description">Ghi chú (không bắt buộc)</Label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Nhập ghi chú (nếu có)..."
              />
            </div>

            <Button type="submit">Đặt lịch</Button>
          </form>
          {/* Modal đặt lịch thành công */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              {/* Overlay mờ */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

              {/* Modal chính */}
              <div className="relative bg-white rounded-2xl shadow-lg p-10 w-[500px] max-w-full text-center z-10 min-h-[300px]">
                {/* Nút đóng */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>

                {/* Nội dung modal */}
                <div className="text-green-500 text-8xl mb-4 animate-bounce">✔️</div>
                <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600
    drop-shadow-lg animate-pulse">
                  Đặt lịch thành công!
                </h2>

                {/* Nút và link nằm cùng hàng */}
                <div className="flex justify-between items-center mt-20">
                  <span
                    onClick={() => navigate("/trang-chu/lich-su-dat-lich")}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    Xem chi tiết
                  </span>

                  <button
                    onClick={() => navigate("/trang-chu")}
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    Trang chủ
                  </button>
                </div>
              </div>
            </div>
          )}


        </Card>

      </div>
    </div>
  );
}
