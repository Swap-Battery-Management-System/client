import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Model } from "@/types/model";
import axios from "axios";
import { toast } from "sonner";
import { ImageIcon, UploadCloud } from "lucide-react";

export default function RegisterVehicle() {
  const [plate, setPlate] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [modelId, setModelId] = useState("");
  const [vin, setVin] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const [cavetUrl, setCavetUrl] = useState(""); // link ảnh cavet sau khi upload
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Lấy danh sách model xe
  const modelList = async () => {
    try {
      const res = await api.get("/models", { withCredentials: true });
      const data: Model[] = res.data.data;
      setModels(data);
      console.log("ds model:", res.data);
    } catch (err) {
      console.error("Không thể lấy danh sách model:", err);
      setMessage("Chúng tôi gặp chút lỗi. Bạn thử lại sau nhé");
      setIsSuccess(false);
      setOpen(true);
    }
  };

  useEffect(() => {
    modelList();
  }, []);

 const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setPreview(URL.createObjectURL(file));
  setUploading(true);
  toast.info("Đang tải ảnh cavet lên...");

  try {
    const formData = new FormData();
    formData.append("key", "4a4efdffaf66aa2a958ea43ace6f49c1"); // key ImgBB của bạn
    formData.append("image", file);

    const res = await axios.post("https://api.imgbb.com/1/upload", formData);
    const uploadedUrl = res.data.data.url;

    setCavetUrl(uploadedUrl);
    toast.success("Tải ảnh cavet thành công!");
  } catch (err) {
    console.error(err);
    toast.error("Không thể tải ảnh cavet lên!");
  } finally {
    setUploading(false);
  }
};
  // Gửi form đăng ký xe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      licensePlates: plate.trim(),
      VIN: vin.trim(),
      modelId,
      name: name.trim(),
    };

    setLoading(true);
    console.log("Payload gửi đi:", payload);

    try {
      const res = await api.post("/vehicles", payload, {
        withCredentials: true,
      });

      if (res.data?.status === "success" && res.data?.code === 201) {
        setIsSuccess(true);
        setMessage(
          "🎉 Đăng ký xe thành công! Chúng tôi sẽ duyệt hồ sơ sớm nhất."
        );

        // Reset form
        setPlate("");
        setVin("");
        setModelId("");
        setName("");
      }
    } catch (err: any) {
      console.error("Error registering vehicle:", err);
      const status = err.response?.status;

      if (status === 400) {
        setMessage(
          "Thông tin không hợp lệ hoặc xe này đã được đăng ký trước đó."
        );
      } else if (status === 401) {
        setMessage(
          "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (status === 404) {
        setMessage("Không tìm thấy thông tin cần thiết. Vui lòng thử lại sau.");
      } else {
        setMessage(
          "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau ít phút."
        );
      }

      setIsSuccess(false);
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const isFormValid = plate && modelId && vin && name && cavetUrl;

  return (
    <div className="flex h-screen bg-[#E9F8F8]">
      <main className="flex-1 p-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
          Đăng ký xe
        </h1>

        <Card className="max-w-4xl mx-auto p-8 shadow-lg border border-[#BCE7E8] bg-white/80">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
            {/* Cột trái - thông tin xe */}
            <div className="space-y-4">
              {/* Tên xe */}
              <div>
                <Label className="text-[#38A3A5]">Tên xe</Label>
                <Input
                  placeholder="VD: Evo S..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                />
              </div>

              {/* Biển số xe */}
              <div>
                <Label className="text-[#38A3A5]">Biển số xe *</Label>
                <Input
                  placeholder="Nhập biển số xe"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  required
                  className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                />
              </div>

              {/* Model */}
              <div>
                <Label className="text-[#38A3A5]">Chọn model *</Label>
                <select
                  className="w-full border border-[#BCE7E8] rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                  onChange={(e) => setModelId(e.target.value)}
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
                <Label className="text-[#38A3A5]">Số khung (VIN) *</Label>
                <Input
                  placeholder="Nhập số khung (VIN)"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  required
                  className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className={`w-1/2 font-medium transition-all duration-300 ${
                    isFormValid && !loading
                      ? "bg-[#38A3A5] hover:bg-[#2C8C8E] text-white"
                      : "bg-[#CFECEC] text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Đang gửi..." : "Đăng ký xe"}
                </Button>
              </div>
            </div>

            {/* Cột phải - ảnh cavet */}
            <div className="flex flex-col items-start justify-start">
              <Label className="text-[#38A3A5] self-start">
                Ảnh cavet xe *
              </Label>

              <label
                htmlFor="cavet-upload"
                className="flex items-center justify-start gap-2 mt-3 bg-[#38A3A5] hover:bg-[#2C8C8E] text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition"
              >
                <UploadCloud size={18} />
                {uploading ? "Đang tải..." : "Chọn ảnh"}
              </label>

              <input
                id="cavet-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />

              {preview ? (
                <img
                  src={preview}
                  alt="Cavet Preview"
                  className="mt-4 w-80 h-auto rounded-lg border border-[#BCE7E8] shadow-sm"
                />
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center border border-dashed border-[#BCE7E8] rounded-lg p-6 text-gray-500 w-80 h-48">
                  <ImageIcon className="mb-2" />
                  Chưa chọn ảnh
                </div>
              )}
            </div>
          </form>
        </Card>
      </main>

      {/* Modal thông báo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`text-center ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {isSuccess ? "Thành công" : "Thông báo"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-gray-700 mt-2">{message}</p>
          <DialogFooter className="mt-4 flex justify-center">
            <Button
              onClick={() => setOpen(false)}
              className={`${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
