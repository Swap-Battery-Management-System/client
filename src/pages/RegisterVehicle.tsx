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
  const {user}=useAuth();

  const modelList = async () => {
    try {
      const res = await api.get("/models", { withCredentials: true });
      const data: Model[] = res.data.data;
      console.log(res.data);
      setModels(data);
    } catch(err) {
        console.log("không thể lấy danh sách model: ", err);
    }
  };

  useEffect(()=>{
    modelList();
  },[]);

  //   const models = [
  //     { id: "M001", name: "Yadea G5", batteryTypeId: "B001" },
  //     { id: "M002", name: "VinFast Feliz", batteryTypeId: "B002" },
  //     { id: "M003", name: "DatBike Weaver", batteryTypeId: "B003" },
  //   ];

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModel = models.find((m) => m.id === e.target.value);
    if (selectedModel) {
      setModelId(selectedModel.id);
    } else {
      setModelId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ plate, modelId, vin });
    try {
      const res = await api.post("/vehicles", {
        licensePlates: plate,
        VIN: vin,
        modelId: modelId,
        userId: user?.id,
      });
      if (res.data?.success) {
        toast.success(
          "Đăng ký xe thành công! Chúng tôi sẽ thông báo sau khi hồ sơ được duyệt."
        );
        console.log("Vehicle registered:", res.data.data);
        setPlate("");
        setVin("");
        setModelId("");
      } else {
        toast.warning("Đăng ký không thành công, vui lòng thử lại!");
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error("Thông tin không hợp lệ hoặc xe đã tồn tại!");
      } else {
        toast.error("Có lỗi xảy ra trong quá trình đăng ký!");
      }
      console.error(err);
    }
  };

  const isFormValid = plate && modelId && vin;

  return (
    <div className="flex h-screen bg-[#E9F8F8]">
      <main className="flex-1 p-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
          Đăng ký xe
        </h1>

        <Card className="max-w-lg mx-auto p-6 space-y-5 shadow-lg border border-[#BCE7E8] bg-white/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-[#38A3A5]">Biển số xe</Label>
              <Input
                placeholder="Nhập biển số xe"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                required
              />
            </div>

            <div>
              <Label className="text-[#38A3A5]">Chọn model</Label>
              <select
                className="w-full border border-[#BCE7E8] rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                onChange={handleModelChange}
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

            <div>
              <Label className="text-[#38A3A5]">Nhập VIN</Label>
              <Input
                placeholder="Nhập số VIN"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                required
              />
            </div>

            <div className="flex justify-center mt-4">
              <Button
                type="submit"
                disabled={!isFormValid}
                className={`w-1/2 font-medium transition-all duration-300 ${
                  isFormValid
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
