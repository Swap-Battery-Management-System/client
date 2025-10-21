import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Model } from "@/types/model";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RegisterVehicle() {
  const [plate, setPlate] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [modelId, setModelId] = useState("");
  const [vin, setVin] = useState("");
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext

  // 🧠 Lấy danh sách model xe
  const modelList = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để xem danh sách model!");
        return;
      }

      const res = await api.get("/models", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const data: Model[] = res.data.data;
      setModels(data);
      console.log("✅ Model list:", data);
    } catch (err) {
      console.error("❌ Không thể lấy danh sách model:", err);
      toast.error("Không thể tải danh sách model xe!");
    }
  };

  useEffect(() => {
    modelList();
  }, []);

  // 🧩 Khi chọn model
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModelId(e.target.value);
  };

  // 🚀 Gửi form đăng ký xe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("⚠️ Bạn cần đăng nhập trước khi đăng ký xe!");
      return;
    }

    // Nếu AuthContext chưa có user (do refresh trang)
    const userId =
      user?.id || JSON.parse(localStorage.getItem("user") || "{}")?.id;

    if (!userId) {
      toast.error("Không thể xác định người dùng, vui lòng đăng nhập lại!");
      return;
    }

    const payload = {
      licensePlates: plate.trim(),
      VIN: vin.trim(),
      modelId: modelId,
      userId: userId,
    };

    console.log("📦 Payload gửi đi:", payload);

    try {
      const res = await api.post("/vehicles", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("📬 Phản hồi từ server:", res.data);

      // 🔍 Kiểm tra theo cấu trúc thật của API
      if (res.data?.status === "success" && res.data?.code === 201) {
        toast.success("🚗 Đăng ký xe thành công! Chúng tôi sẽ duyệt hồ sơ sớm nhất.");
        console.log("✅ Vehicle registered successfully:", res.data.data);

        // Reset form
        setPlate("");
        setVin("");
        setModelId("");
      } else {
        toast.warning(
          "⚠️ Đăng ký không thành công: " +
          (res.data?.message || "Không rõ lý do từ server.")
        );
      }
    } catch (err: any) {
      console.error("❌ Error registering vehicle:", err);

      const status = err.response?.status;
      if (status === 400) {
        toast.error("Thông tin không hợp lệ hoặc xe đã tồn tại!");
      } else if (status === 401) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      } else if (status === 404) {
        toast.error("Không tìm thấy tài nguyên, vui lòng kiểm tra API URL!");
      } else {
        toast.error("Có lỗi xảy ra trong quá trình đăng ký!");
      }
    }

  };

  const isFormValid = plate && modelId && vin;

  // 🧱 Giao diện
  return (
    <div className="flex h-screen bg-[#E9F8F8]">
      <main className="flex-1 p-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
          Đăng ký xe
        </h1>

        <Card className="max-w-lg mx-auto p-6 space-y-5 shadow-lg border border-[#BCE7E8] bg-white/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Biển số xe */}
            <div>
              <Label className="text-[#38A3A5]">Biển số xe</Label>
              <Input
                placeholder="Nhập biển số xe "
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                required
              />
            </div>

            {/* Model */}
            <div>
              <Label className="text-[#38A3A5]">Chọn model</Label>
              <select
                className="w-full border border-[#BCE7E8] rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                onChange={handleModelChange}
                value={modelId}
                required
              >
                <option value="">-- Chọn model --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* VIN */}
            <div>
              <Label className="text-[#38A3A5]">Số khung (VIN)</Label>
              <Input
                placeholder="Nhập số VIN "
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                required
              />
            </div>

            {/* Nút submit */}
            <div className="flex justify-center mt-4">
              <Button
                type="submit"
                disabled={!isFormValid}
                className={`w-1/2 font-medium transition-all duration-300 ${isFormValid
                  ? "bg-[#38A3A5] hover:bg-[#2C8C8E] text-white"
                  : "bg-[#CFECEC] text-gray-500 cursor-not-allowed"
                  }`}
              >
                Đăng ký thông tin xe
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
