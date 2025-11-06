import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  BatteryWarning,
  ServerCrash,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useStation } from "@/context/StationContext";

interface BookingForm {
  stationId: string;
  vehicleId: string;
  date: string;
  time: string;
  note: string;
}
interface BookingPayload {
  scheduleTime: string;
  note?: string;
  vehicleId: string;
  stationId: string;
}

interface Vehicle {
  id: string;
  name: string;
  status: "pending" | "active" | "inactive";
  batteryTypeId: string;
}

interface Battery {
  id: string;
}

export default function Booking() {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);
  const [modalIcon, setModalIcon] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchAllStation, stations } = useStation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const now = new Date(Date.now());
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  // Use local date strings (YYYY-MM-DD) to avoid UTC shifts from toISOString()
  const localDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}-${m}-${day}`;
  };
  const minDate = localDateString(now);
  const maxDate = localDateString(in24h);
  const minTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const maxTime = `${pad(in24h.getHours())}:${pad(in24h.getMinutes())}`;
  // Allowed booking window (inclusive): 06:00 - 22:00
  const ALLOWED_START = "06:00";
  const ALLOWED_END = "22:00";

  const timeStrToMinutes = (t: string) => {
    const [hh, mm] = t.split(":").map((s) => Number(s));
    return hh * 60 + mm;
  };
  const location = useLocation();
  const defaultStationId = location.state?.id ?? "";
  const [hasCompatibleBattery, setHasCompatibleBattery] = useState<
    boolean | null
  >(null);

  const [form, setForm] = useState<BookingForm>({
    stationId: defaultStationId,
    vehicleId: "",
    date: "",
    time: "",
    note: "",
  });
  // validation state for time selection (more than 24 hours)
  const [timeError, setTimeError] = useState<string | null>(null);
  // other field validation states
  const [stationError, setStationError] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // const isComplete =
    //   Boolean(user.fullName) &&
    //   Boolean(user.phoneNumber) &&
    //   Boolean(user.address);

    // // Nếu form chưa complete và thông tin chưa đầy đủ → chỉ toast 1 lần
    // if (!isComplete) {
    //   if (isCompleteForm) {
    //     toast.error(
    //       "Vui lòng hoàn thiện thông tin cá nhân trước khi đặt lịch!"
    //     );
    //     setIsCompleteForm(false);
    //   }
    // } else {
    //   setForm((prev) => ({ ...prev, userName: user.fullName as string}));
    //   setIsCompleteForm(true);
    // }
  }, []);

  const checkPendingBooking = async () => {
    try {
      const res = await api.get("/bookings", { withCredentials: true });
      const bookings = res.data.data.bookings || [];
      const pending = bookings.some(
        (b: any) => b.status === "scheduled" || b.status === "pending"
      );
      setHasPendingBooking(pending);
    } catch (err) {
      console.log("không thể kiểm tra booking: ", err);
    } finally {
      setLoading(false);
    }
  };

  //lấy xe của driver
  const fetchAllAvailableVehicle = async () => {
    try {
      const res = await api.get("/vehicles", { withCredentials: true });
      const data = res.data.data.vehicles;
      console.log(res.data);

      const filtered: Vehicle[] = data
        .filter((v: any) => v.status === "active" && v.userId === user?.id)
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          status: v.status,
          batteryTypeId: v.model.batteryType.id,
        }));
      console.log(res.data);
      console.log("payloadVehicle:", filtered);
      setVehicles(filtered);
    } catch (err) {
      console.log("khong the lay ds xe:", err);
    }
  };

  useEffect(() => {
    fetchAllStation();
    fetchAllAvailableVehicle();
    checkPendingBooking();
    console.log("user booking", user);
  }, []);

  //gọi hàm kiểm tra pin available khi stationId or VehicleId thay đổi
  useEffect(() => {
    if (form.stationId && form.vehicleId) {
      checkAvailableBattery();
    }
  }, [form.stationId, form.vehicleId]);

  //xử lý khi select
  const handleSelectChange = (name: string, value: string) => {
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    // validate this field right away
    validateField(name, value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setForm({ ...form, [e.target.name]: value });
    // validate as user types/changes
    validateField(e.target.name, value);
  };

  // Validate a single field and set related error state
  function validateField(name: string, value: string) {
    switch (name) {
      case "stationId":
        if (!value) setStationError("Vui lòng chọn trạm");
        else setStationError(null);
        break;
      case "vehicleId":
        if (!value) setVehicleError("Vui lòng chọn xe");
        else setVehicleError(null);
        break;
      case "date":
        if (!value) {
          setDateError("Vui lòng chọn ngày");
        } else {
          // compare as dates (local) to avoid string/utc pitfalls
          const selected = new Date(`${value}T00:00:00`);
          const minD = new Date(`${minDate}T00:00:00`);
          const maxD = new Date(`${maxDate}T23:59:59`);
          if (
            selected.getTime() < minD.getTime() ||
            selected.getTime() > maxD.getTime()
          ) {
            setDateError("Ngày không hợp lệ");
          } else {
            setDateError(null);
          }
        }
        break;
      case "note":
        if (value && value.length > 500)
          setNoteError("Ghi chú không quá 500 ký tự");
        else setNoteError(null);
        break;
      case "time":
        // Validate allowed booking window immediately when time changes
        if (!value) {
          setTimeError(null);
        } else {
          const vMin = timeStrToMinutes(value);
          const start = timeStrToMinutes(ALLOWED_START);
          const end = timeStrToMinutes(ALLOWED_END);
          if (vMin < start || vMin > end) {
            setTimeError(`Thời gian phải nằm trong khung ${ALLOWED_START}–${ALLOWED_END}`);
          } else {
            setTimeError(null);
          }
        }
        break;
      default:
        break;
    }
  }

  // Validate all fields synchronously using current form values and set errors. Returns true when valid.
  function validateAll(): boolean {
    let valid = true;

    if (!form.stationId) {
      setStationError("Vui lòng chọn trạm");
      valid = false;
    } else {
      setStationError(null);
    }

    if (!form.vehicleId) {
      setVehicleError("Vui lòng chọn xe");
      valid = false;
    } else {
      setVehicleError(null);
    }

    if (!form.date) {
      setDateError("Vui lòng chọn ngày");
      valid = false;
    } else {
      const selected = new Date(`${form.date}T00:00:00`);
      const minD = new Date(`${minDate}T00:00:00`);
      const maxD = new Date(`${maxDate}T23:59:59`);
      if (
        selected.getTime() < minD.getTime() ||
        selected.getTime() > maxD.getTime()
      ) {
        setDateError("Ngày không hợp lệ");
        valid = false;
      } else {
        setDateError(null);
      }
    }

    if (!form.time) {
      setTimeError("Vui lòng chọn giờ");
      valid = false;
    }

    // Check allowed time window
    if (form.time) {
      const vMin = timeStrToMinutes(form.time);
      const start = timeStrToMinutes(ALLOWED_START);
      const end = timeStrToMinutes(ALLOWED_END);
      if (vMin < start || vMin > end) {
        setTimeError(`Thời gian phải nằm trong khung ${ALLOWED_START}–${ALLOWED_END}`);
        valid = false;
      }
    }

    if (form.note && form.note.length > 500) {
      setNoteError("Ghi chú không quá 500 ký tự");
      valid = false;
    } else {
      setNoteError(null);
    }

    // If timeError from combined validation exists, invalidate
    if (timeError) valid = false;

    return valid;
  }

  // Validate combined date+time to ensure schedule is within 24 hours from now
  useEffect(() => {
    const { date, time } = form;
    if (!date || !time) {
      setTimeError(null);
      return;
    }

    const schedule = new Date(`${date}T${time}:00`);
    const now = new Date();
    const diff = schedule.getTime() - now.getTime();
    const maxMs = 24 * 60 * 60 * 1000;

    if (isNaN(schedule.getTime())) {
      setTimeError("Thời gian không hợp lệ");
      return;
    }

    if (diff > maxMs) {
      setTimeError("Thời gian chọn vượt quá 24 giờ");
    } else if (diff < 0) {
      setTimeError("Thời gian đã qua");
    } else {
      // also ensure selected time falls inside allowed business window
      const vMin = timeStrToMinutes(time);
      const start = timeStrToMinutes(ALLOWED_START);
      const end = timeStrToMinutes(ALLOWED_END);
      if (vMin < start || vMin > end) {
        setTimeError(`Thời gian phải nằm trong khung ${ALLOWED_START}–${ALLOWED_END}`);
      } else {
        setTimeError(null);
      }
    }
  }, [form.date, form.time]);

  // compute effective min/max for the time input considering now/24h and allowed window
  const allowedStartMin = timeStrToMinutes(ALLOWED_START);
  const allowedEndMin = timeStrToMinutes(ALLOWED_END);

  const inputMinMinutes =
    form.date === minDate
      ? Math.max(timeStrToMinutes(minTime), allowedStartMin)
      : allowedStartMin;

  const inputMaxMinutes =
    form.date === maxDate
      ? Math.min(timeStrToMinutes(maxTime), allowedEndMin)
      : allowedEndMin;

  const minTimeForInputStr = `${pad(Math.floor(inputMinMinutes / 60))}:${pad(
    inputMinMinutes % 60
  )}`;
  const maxTimeForInputStr = `${pad(Math.floor(inputMaxMinutes / 60))}:${pad(
    inputMaxMinutes % 60
  )}`;

  const noValidTimeForSelectedDate = inputMinMinutes > inputMaxMinutes;

  //kiểm tra có pin phù hợp hay không
  const checkAvailableBattery = async () => {
    try {
      const res = await api.get(`/batteries/station/${form.stationId}`);
      const batteries = res.data.data.batteries;
      const vehicle = vehicles.find((v) => v.id === form.vehicleId);

      if (!vehicle) {
        console.warn("Không tìm thấy thông tin xe.");
        setHasCompatibleBattery(false);
        return;
      }

      // Kiểm tra xem có pin phù hợp và còn khả dụng hay không
      const compatible = batteries.some(
        (b: any) =>
          b.batteryTypeId === vehicle.batteryTypeId && b.status === "available"
      );

      setHasCompatibleBattery(compatible);
    } catch (err) {
      console.error("Lỗi khi kiểm tra pin:", err);
      setHasCompatibleBattery(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Re-validate all fields before submit
    const ok = validateAll();
    if (!ok) {
      toast.error("⚠️ Vui lòng sửa các trường bị lỗi trước khi gửi.");
      return;
    }
    const { stationId, vehicleId, date, time, note } = form;

    if (!stationId || !vehicleId || !date || !time) {
      toast.error("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const scheduleTime = `${date}T${time}:00`;

    const payload: BookingPayload = {
      scheduleTime: scheduleTime,
      note,
      vehicleId,
      stationId,
    };
    console.log("booking", payload);

    try {
      setSubmitting(true);
      const res = await api.post("/bookings", payload, {
        withCredentials: true,
      });
      const booking = res.data.data.booking;
      const bookingStatus = booking.status;

      setIsSuccess(true);
      setShowModal(true);

      if (bookingStatus === "pending") {
        // Trường hợp: chưa có pin phù hợp
        setModalIcon(
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        );
        setModalMessage(
          "Đặt lịch thành công! Tuy nhiên, hiện tại hệ thống chưa tìm thấy pin phù hợp cho xe của bạn. " +
            "Lịch của bạn đang ở trạng thái *chờ xử lý*. Nếu sau một thời gian vẫn không có pin phù hợp, " +
            "lịch có thể sẽ tự động bị hủy. Vui lòng thường xuyên kiểm tra lại trong mục đặt lịch nhé!"
        );
      } else if (bookingStatus === "scheduled") {
        // Trường hợp: có pin phù hợp, đặt lịch hoàn tất
        setModalIcon(
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        );
        setModalMessage(
          "Đặt lịch thành công! Hệ thống đã tìm thấy pin phù hợp, " +
            "hãy chuẩn bị để đổi pin đúng giờ nhé!"
        );
      } else {
        //  Trường hợp khác (phòng khi backend thay đổi)
        setModalIcon(
          <XCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        );
        setModalMessage(
          `Đặt lịch thành công với trạng thái: ${status}. Vui lòng kiểm tra lại trong danh sách đặt lịch của bạn.`
        );
      }
    } catch (err: any) {
      const status = err.response?.status;
      console.log("không thể đặt lịch ", err);
      if (status === 400) {
        setModalIcon(
          <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        );
        setModalMessage(
          "Dữ liệu đầu vào không hợp lệ hoặc bị thiếu. Vui lòng kiểm tra lại thông tin!"
        );
      } else if (status === 500) {
        setModalIcon(
          <ServerCrash className="w-10 h-10 text-red-500 mx-auto mb-3" />
        );
        setModalMessage(
          "Lỗi hệ thống! Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ."
        );
      } else {
        setModalIcon(
          <XCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        );
        setModalMessage("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
      }

      setIsSuccess(false);
      setShowModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] flex items-start py-12">
      <div className="container mx-auto p-4 flex justify-center">
        <Card className="p-8 w-full max-w-4xl bg-white/80 shadow-xl rounded-3xl border border-[#A3E4D7] hover:shadow-2xl transition-all">
          {loading ? (
            //  Loading khi kiểm tra booking khả dụng
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38A3A5] mb-4"></div>
              <p className="text-[#38A3A5] text-lg font-medium">
                Chờ một chút nhé, hệ thống đang kiểm tra lịch đặt của bạn...
              </p>
            </div>
          ) : hasPendingBooking ? (
            //  user đang có booking pending
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <AlertTriangle className="w-16 h-16 text-yellow-500 animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#38A3A5] mb-4">
                Bạn đang có một lịch đặt đang tiến hành
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Vui lòng hoàn tất hoặc hủy lịch hiện tại trước khi tạo lịch mới
                nhé!
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => navigate("/home/booking-history")}
                  className="bg-[#38A3A5] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                  Xem chi tiết lịch đặt
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="px-6 py-3 rounded-xl"
                >
                  Trang chủ
                </Button>
              </div>
            </div>
          ) : (
            // không có booking pending → hiển thị form đặt lịch
            <>
              <h1 className="text-3xl font-extrabold mb-8 text-center text-[#38A3A5]">
                Đặt lịch thay pin
              </h1>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <Label className="text-[#38A3A5] mb-2 block">
                      Tên trạm
                    </Label>
                    <div className="relative">
                      <Select
                        value={form.stationId}
                        onValueChange={(value) =>
                          handleSelectChange("stationId", value)
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

                      {stationError && (
                        <p className="text-red-500 text-sm mt-1">
                          {stationError}
                        </p>
                      )}

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
                    <Label className="text-[#38A3A5] mb-2 block">
                      Xe của bạn
                    </Label>
                    <Select
                      value={form.vehicleId}
                      onValueChange={(value) =>
                        handleSelectChange("vehicleId", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          "w-full " +
                          (vehicleError
                            ? "border-red-500 focus:ring-red-200"
                            : "")
                        }
                      >
                        <SelectValue placeholder="Chọn xe của bạn" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vh) => (
                          <SelectItem key={vh.id} value={vh.id}>
                            {vh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {vehicleError && (
                      <p className="text-red-500 text-sm mt-1">
                        {vehicleError}
                      </p>
                    )}

                    {hasCompatibleBattery === false && (
                      <div className="flex items-center gap-2 mt-2 text-yellow-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          Trạm hiện chưa có pin phù hợp với xe của bạn. Bạn vẫn
                          có thể đặt lịch trước — lịch sẽ ở trạng thái{" "}
                          <b>chờ xử lý (pending)</b>. Khi có pin, lịch sẽ được
                          chuyển sang <b>đã sắp xếp (scheduled)</b>. Nếu đến
                          thời gian hẹn mà trạm vẫn chưa có pin, lịch sẽ tự động{" "}
                          <b>bị hủy</b>.
                        </span>
                      </div>
                    )}

                    {hasCompatibleBattery === true && (
                      <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Có pin phù hợp, bạn có thể đặt lịch.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
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
                        aria-invalid={Boolean(dateError)}
                        className={
                          dateError
                            ? "border-red-500 focus:ring-red-200"
                            : undefined
                        }
                      />
                      {dateError && (
                        <p className="text-red-500 text-sm mt-1">{dateError}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label className="text-[#38A3A5] mb-2 block">Giờ</Label>
                      <Input
                        type="time"
                        name="time"
                        value={form.time}
                        min={minTimeForInputStr}
                        max={maxTimeForInputStr}
                        onChange={handleChange}
                        aria-invalid={Boolean(timeError)}
                        className={
                          timeError
                            ? "border-red-500 focus:ring-red-200"
                            : undefined
                        }
                      />
                      {/* Hiển thị lỗi thời gian nếu có */}
                      {timeError && (
                        <p className="text-red-500 text-sm mt-1">{timeError}</p>
                      )}
                      {noValidTimeForSelectedDate && (
                        <p className="text-red-500 text-sm mt-1">
                          Không có khung giờ hợp lệ cho ngày đã chọn.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="note" className="text-[#38A3A5] mb-2 block">
                      Ghi chú (không bắt buộc)
                    </Label>
                    <textarea
                      id="note"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      className={
                        "w-full p-2 border rounded " +
                        (noteError ? "border-red-500" : "")
                      }
                      rows={4}
                      placeholder="Nhập ghi chú (nếu có)..."
                    />
                    {noteError && (
                      <p className="text-red-500 text-sm mt-1">{noteError}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-2 flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#38A3A5] hover:bg-[#2C9A95] text-white px-8 py-3 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Đặt lịch
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Modal kết quả */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              ></div>

              <div className="relative bg-white rounded-2xl shadow-lg p-10 w-[700px] max-w-full text-center z-10">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>

                {isSuccess ? (
                  <>
                    <h2 className="text-3xl font-extrabold mb-6 text-[#38A3A5] animate-pulse">
                      Đặt lịch thành công!
                    </h2>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-extrabold mb-6 text-red-500 animate-pulse">
                      Không thể đặt lịch
                    </h2>
                  </>
                )}

                <div className="text-center">
                  {modalIcon}
                  <p className="text-gray-700 text-lg">{modalMessage}</p>
                </div>

                <div className="flex justify-center gap-4">
                  {isSuccess ? (
                    <>
                      <Button
                        onClick={() => navigate("/home/booking-history")}
                        className="bg-[#38A3A5] text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        onClick={() => navigate("/home")}
                        variant="outline"
                        className="px-6 py-2 rounded-xl"
                      >
                        Trang chủ
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setShowModal(false)}
                      className="bg-[#38A3A5] text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
                    >
                      Đóng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
