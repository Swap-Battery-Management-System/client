import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import type { Station } from "@/types/station";
import api from "@/lib/api";

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
  const [stations,setStations]=useState<Station[]>([]);

  // 🔹 Data test sẵn
  const userName = "Nguyễn Văn A";
  // const stations = [
  //   "Trạm Vincom Đồng Khởi",
  //   "Trạm Landmark 81",
  //   "Trạm Quận 7",
  //   "Trạm Gò Vấp",
  // ];
  const fetchAllStation = async () => {
    try {
      const res = await api.get("/stations", { withCredentials: true });
      const data: Station[] = res.data.data.station;
      setStations(data);
      console.log("ds tram: ", res.data);
    } catch (err) {
      console.log("Lỗi khi lấy danh sách trạm:", err);
    } 
  };

  const vehicles = ["VinFast Klara S", "VinFast Feliz", "VinFast VF3"];

  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const minDate = now.toISOString().split("T")[0];
  const maxDate = in24h.toISOString().split("T")[0];
  const minTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const maxTime = "23:59";

  const [form, setForm] = useState<BookingForm>({
    userName,
    station: "",
    vehicleType: "",
    batteryType: "",
    date: "",
    time: "",
    description: "",
  });


//xử lý thay đổi
  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //xử lý submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { station, vehicleType, batteryType, date, time } = form;

    if (!station || !vehicleType || !batteryType || !date || !time) {
      alert("⚠️ Vui lòng điền đầy đủ tất cả thông tin bắt buộc!");
      return;
    }

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const selected = new Date(`${form.date}T${form.time}`);

    if (selected < now || selected > in24h) {
      alert("⚠️ Vui lòng chọn ngày giờ trong vòng 24 giờ!");
      return;
    }

    console.log("Booking submitted:", form);
    setShowModal(true);
  };

  useEffect(()=>{
    fetchAllStation();
  },[])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] flex items-start py-12">
      <div className="container mx-auto p-4 flex justify-center">
        <Card className="p-8 w-full max-w-4xl bg-white/80 shadow-xl rounded-3xl border border-[#A3E4D7] hover:shadow-2xl transition-all">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-[#38A3A5]">
            Đặt lịch thay pin
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            {/* Cột trái */}
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="userName" className="text-[#38A3A5] mb-2 block">
                  Tên người dùng
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  value={form.userName}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label className="text-[#38A3A5] mb-2 block">Tên trạm</Label>
                <div className="relative">
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("station", value)
                    }
                  >
                    <SelectTrigger className="w-full pr-10">
                      <SelectValue placeholder="Chọn trạm" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#38A3A5]"
                    onClick={() =>
                      window.open("https://www.google.com/maps", "_blank")
                    }
                  >
                    <MapPin className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-[#38A3A5] mb-2 block">Xe của bạn</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("vehicleType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn xe của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vh) => (
                      <SelectItem key={vh} value={vh}>
                        {vh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cột phải */}
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-[#38A3A5] mb-2 block">Loại pin</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("batteryType", value)
                  }
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

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-[#38A3A5] mb-2 block">Ngày</Label>
                  <Input
                    type="date"
                    name="date"
                    value={form.date}
                    min={minDate}
                    max={maxDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex-1">
                  <Label className="text-[#38A3A5] mb-2 block">Giờ</Label>
                  <Input
                    type="time"
                    name="time"
                    value={form.time}
                    min={form.date === minDate ? minTime : "00:00"}
                    max={form.date === maxDate ? maxTime : "23:59"}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-[#38A3A5] mb-2 block"
                >
                  Ghi chú (không bắt buộc)
                </Label>
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
            </div>

            <div className="col-span-2 flex justify-center pt-4">
              <Button
                type="submit"
                disabled={
                  !form.station ||
                  !form.vehicleType ||
                  !form.batteryType ||
                  !form.date ||
                  !form.time
                }
                className="bg-[#38A3A5] hover:bg-[#2C9A95] text-white px-8 py-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đặt lịch
              </Button>
            </div>
          </form>

          {/* Modal thành công */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              ></div>

              <div className="relative bg-white rounded-2xl shadow-lg p-10 w-[480px] max-w-full text-center z-10">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>

                <div className="text-[#38A3A5] text-8xl mb-4 animate-bounce">
                  ✔️
                </div>
                <h2 className="text-3xl font-extrabold mb-6 text-[#38A3A5] animate-pulse">
                  Đặt lịch thành công!
                </h2>

                <div className="flex justify-between items-center mt-10">
                  <span
                    onClick={() => navigate("/trang-chu/lich-su-dat-lich")}
                    className="text-sm text-[#38A3A5] hover:underline cursor-pointer"
                  >
                    Xem chi tiết
                  </span>

                  <button
                    onClick={() => navigate("/trang-chu")}
                    className="bg-[#38A3A5] text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
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
