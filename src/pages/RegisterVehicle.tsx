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
  // validation errors
  const [plateError, setPlateError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [cavetError, setCavetError] = useState<string | null>(null);

  // Modal state
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const [cavetUrl, setCavetUrl] = useState(""); // link ảnh cavet sau khi upload

  // state mới để lưu kết quả OCR
  const [ocrLoading, setOcrLoading] = useState(false);
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

  // const handleOCR = async (file: File) => {
  //   setOcrLoading(true);
  //   toast.info("Đang đọc dữ liệu từ cavet xe...");

  //   try {
  //     const { data } = await Tesseract.recognize(file, "vie", {
  //       logger: (m) => console.log(m),
  //     });

  //     const text = data.text;
  //     console.log("OCR Result:", text);

  //     // Ví dụ regex để lấy biển số và VIN
  //     const licenseMatch = text.match(
  //       /\b\d{2}[A-Z]{1,2}-\d{3,4}(\.\d{1,2})?\b/
  //     );
  //     const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/);

  //     if (licenseMatch || vinMatch) {
  //       if (licenseMatch) setPlate(licenseMatch[0]);
  //       if (vinMatch) setVin(vinMatch[0]);
  //       toast.success("Đã tự động điền thông tin từ cavet!");
  //     } else {
  //       // Không tìm thấy biển số hay VIN nào
  //       toast.error("Không đọc được dữ liệu từ cavet. Vui lòng nhập thủ công.");
  //       console.warn("OCR không tìm thấy biển số hoặc VIN trong ảnh.");
  //     }
  //   } catch (err) {
  //     console.error("OCR Error:", err);
  //     toast.error("Không đọc được dữ liệu từ cavet. Vui lòng nhập thủ công.");
  //   } finally {
  //     setOcrLoading(false);
  //   }
  // };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      // Upload ảnh lên Cloudinary
      toast.info("Đang tải ảnh lên cloud...");

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append("file", file);
      if (uploadPreset) formData.append("upload_preset", uploadPreset);
      // optional folder
      formData.append("folder", "swapnet_cavets");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload thất bại");

      setCavetUrl(data.secure_url);
      // validate cavet after upload
      validateField("cavet", data.secure_url);
      toast.success("Tải ảnh cavet thành công!");

      // Bước OCR (nếu cần)
      // await handleOCR(file);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải ảnh cavet lên cloud!");
    } finally {
      setUploading(false);
    }
  };

  // validate single field and set error messages
  function validateField(nameField: string, value: string) {
    switch (nameField) {
      case "plate":
        // allow letters, digits, spaces, dot and dash
        if (!value || !value.trim()) setPlateError("Vui lòng nhập biển số");
        else if (!/^[A-Z0-9 .-]+$/.test(value.trim()))
          setPlateError("Biển số không hợp lệ (không chứa ký tự đặc biệt)");
        else setPlateError(null);
        break;
      case "model":
        if (!value) setModelError("Vui lòng chọn model");
        else setModelError(null);
        break;
      case "vin":
        // VIN must be 17 characters, letters (excluding I,O,Q) and digits
        if (!value || !value.trim())
          setVinError("Vui lòng nhập số khung (VIN)");
        else if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(value.trim()))
          setVinError(
            "VIN không hợp lệ (17 ký tự chữ hoa và số, không chứa I/O/Q)"
          );
        else setVinError(null);
        break;
      case "name":
        // No required validation for name; if user leaves it empty we'll default it on submit
        setNameError(null);
        break;
      case "cavet":
        if (!value) setCavetError("Vui lòng tải ảnh cavet");
        else setCavetError(null);
        break;
      default:
        break;
    }
  }
  // Gửi form đăng ký xe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run inline validation so errors appear under inputs
    validateField("plate", plate);
    validateField("model", modelId);
    validateField("vin", vin);
    validateField("cavet", cavetUrl);

    // Validate required fields before sending. Do not disable button when fields are missing; show toast instead.
    if (!plate || !modelId || !vin || !cavetUrl) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin bắt buộc và tải ảnh cavet trước khi gửi."
      );
      return;
    }

    // If user didn't provide a name, default to "{model name} {licensePlate}"
    let finalName = name.trim();
    if (!finalName) {
      const model = models.find((m) => m.id === modelId);
      const modelName = (model?.name || "Xe").trim();
      finalName = `${modelName} (${plate.trim()})`;
      setName(finalName);
    }

    const payload = {
      licensePlates: plate.trim(),
      VIN: vin.trim(),
      modelId,
      name: finalName,
      validatedImage: cavetUrl,
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
          "Xe này đã được đăng ký trước đó."
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

  const isFormValid = plate && modelId && vin && cavetUrl;

  return (
    <div className="flex h-screen bg-[#E9F8F8]">
      <main className="flex-1 p-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
          Đăng ký xe
        </h1>

        <Card className="max-w-4xl mx-auto p-8 shadow-lg border border-[#BCE7E8] bg-white/80">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Cột trái - thông tin xe */}
            <div className="space-y-4">
              {/* Tên xe */}
              <div>
                <Label className="text-[#38A3A5]">Tên xe</Label>
                <Input
                  placeholder="VD: Evo S..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateField("name", e.target.value);
                  }}
                  className="border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5]"
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
              </div>

              {/* Biển số xe */}
              <div>
                <Label className="text-[#38A3A5]">Biển số xe *</Label>
                <Input
                  placeholder="Nhập biển số xe"
                  value={plate}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setPlate(v);
                    validateField("plate", v);
                  }}
                  className={
                    "border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5] " +
                    (plateError ? "border-red-500" : "")
                  }
                />
                {plateError && (
                  <p className="text-red-500 text-sm mt-1">{plateError}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <Label className="text-[#38A3A5]">Chọn model *</Label>
                <select
                  className={
                    "w-full rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5] outline-none " +
                    (modelError ? "border-red-500" : "border border-[#BCE7E8]")
                  }
                  onChange={(e) => {
                    setModelId(e.target.value);
                    validateField("model", e.target.value);
                  }}
                  value={modelId}
                >
                  <option value="">-- Chọn model --</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {modelError && (
                  <p className="text-red-500 text-sm mt-1">{modelError}</p>
                )}
              </div>

              {/* VIN */}
              <div>
                <Label className="text-[#38A3A5]">Số khung (VIN) *</Label>
                <Input
                  placeholder="Nhập số khung (VIN)"
                  value={vin}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setVin(v);
                    validateField("vin", v);
                  }}
                  className={
                    "border-[#BCE7E8] focus:ring-[#38A3A5] focus:border-[#38A3A5] " +
                    (vinError ? "border-red-500" : "")
                  }
                />
                {vinError && (
                  <p className="text-red-500 text-sm mt-1">{vinError}</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-1/2 font-medium transition-all duration-300 ${
                    loading
                      ? "bg-[#CFECEC] text-gray-500 cursor-not-allowed"
                      : "bg-[#38A3A5] hover:bg-[#2C8C8E] text-white"
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

              {/* Khung preview với nút X */}
              <div className="mt-4 relative w-80 h-48 border border-dashed border-[#BCE7E8] rounded-lg overflow-hidden">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Cavet Preview"
                      className="w-full h-full object-contain"
                    />
                    {/* Nút X góc trên phải */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setCavetUrl("");
                        setPlate(""); // nếu muốn reset luôn biển số
                        setVin(""); // nếu muốn reset luôn VIN
                        // update validation states
                        validateField("cavet", "");
                        validateField("plate", "");
                        validateField("vin", "");
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 w-full h-full">
                    <ImageIcon className="mb-2" />
                    Chưa chọn ảnh
                  </div>
                )}
              </div>
              {uploading && (
                <p className="text-sm text-gray-600 mt-2">
                  Đang tải ảnh lên cloud... Vui lòng chờ.
                </p>
              )}
              {cavetError && (
                <p className="text-red-500 text-sm mt-2">{cavetError}</p>
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
