import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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

  const mockUserName = "Nguyễn Văn A";     // Thay bằng dữ liệu thực tế nếu có

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
    userName: mockUserName,
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Đặt lịch</h1>


        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-8">
          <div className="w-full max-w-md px-4 overflow-y-auto">

            <Card className="p-6 max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* 1. Tên người dùng (readonly) */}
                <div>
                  <Label className="mb-2" htmlFor="userName">Tên người dùng</Label>
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
                  <Label className="mb-2">Tên trạm</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("station", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trạm 1">Trạm 1</SelectItem>
                      <SelectItem value="Trạm 2">Trạm 2</SelectItem>
                      <SelectItem value="Trạm 3">Trạm 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Loại xe */}
                <div>
                  <Label className="mb-2">Loại xe</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("vehicleType", value)}
                  >
                    <SelectTrigger>
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
                  <Label className="mb-2">Loại pin</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("batteryType", value)}
                  >
                    <SelectTrigger>
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
                  <Label className="mb-2">Ngày</Label>
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
                  <Label className="mb-2">Giờ</Label>
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
                  <Label className="mb-2" htmlFor="description">Ghi chú (không bắt buộc)</Label>
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
                  <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setShowModal(false)}
                  ></div>

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
                    <div className="text-green-500 text-6xl mb-4">✔️</div>
                    <h2 className="text-3xl font-bold text-green-600 mb-8">
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
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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


      </div>
    </div>
  );
}
