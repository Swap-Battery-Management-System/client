import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageIcon, UploadCloud } from "lucide-react";

interface Vehicle {
  id: string;
  name?: string;
  licensePlates: string;
  VIN: string;
  status: string;
  validatedImage?: string;
  model?: {
    id: string;
    name: string;
    batteryType?: { id: string; name: string };
  };
}

export default function MyVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [editVIN, setEditVIN] = useState("");
  const [editModelId, setEditModelId] = useState<string | undefined>();
  const [editLoading, setEditLoading] = useState(false);
  const [resubmitMode, setResubmitMode] = useState(false);
  // validation states for edit modal
  const [nameError, setNameError] = useState<string | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cavetError, setCavetError] = useState<string | null>(null);

  // Models
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Image
  const [cavetUrl, setCavetUrl] = useState<string | undefined>();
  const [preview, setPreview] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  // Confirm Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "relink" | null
  >(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles", { withCredentials: true });
      setVehicles(res.data.data?.vehicles || []);
    } catch {
      toast.error("Không thể tải danh sách xe!");
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const res = await api.get("/models", { withCredentials: true });
      setModels(res.data.data || []);
    } catch {
      toast.error("Không thể tải danh sách model!");
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchModels();
  }, []);

  // Render status
  const renderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { label: "Đang chờ duyệt", color: "text-yellow-600" };
      case "active":
        return { label: "Đã duyệt", color: "text-green-600" };
      case "invalid":
        return { label: "Từ chối", color: "text-red-600" };
      case "inactive":
        return { label: "Đã hủy liên kết", color: "text-gray-500" };
      default:
        return { label: "Không rõ", color: "text-gray-700" };
    }
  };

  // Filtered vehicles
  const filteredVehicles =
    filterStatus === "all"
      ? vehicles
      : vehicles.filter((v) => v.status.toLowerCase() === filterStatus);

  // Open edit modal. If resubmit=true, allow editing all fields and submit will create a new vehicle
  const openEditModal = (v: Vehicle, resubmit = false) => {
    setResubmitMode(resubmit);
    setEditVehicle(v);
    setEditName(v.name || "");
    setEditPlate(v.licensePlates || "");
    setEditVIN(v.VIN || "");
    setEditModelId(v.model?.id);
    setCavetUrl(v.validatedImage);
    setPreview(v.validatedImage);
    setEditOpen(true);
    // clear previous errors
    setNameError(null);
    setPlateError(null);
    setVinError(null);
    setModelError(null);
    setCavetError(null);
    // run initial validation to show existing issues inline
    validateField("plate", v.licensePlates || "");
    validateField("vin", v.VIN || "");
    validateField("model", v.model?.id || "");
    validateField("name", v.name || "");
    validateField("cavet", v.validatedImage || "");
  };

  // Handle normal update (active vehicle only)
  const handleUpdateVehicle = async () => {
    if (!editVehicle) return;

    const statusActive = editVehicle.status.toLowerCase() === "active";
    if (!statusActive) {
      toast.error("Chỉ xe đang duyệt mới có thể cập nhật thông tin.");
      return;
    }

    // Validate name
    if (!validateAllEdit()) {
      toast.error("Vui lòng sửa các trường bị lỗi trước khi lưu.");
      return;
    }

    setEditLoading(true);
    try {
      const payload = { name: editName.trim() };
      await api.patch(`/vehicles/${editVehicle.id}`, payload, {
        withCredentials: true,
      });
      toast.success("Cập nhật thông tin xe thành công");
      setEditOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle resubmit (for invalid vehicles)
  const handleResubmitVehicle = async () => {
    if (!editVehicle) return;

    const statusInvalid = editVehicle.status.toLowerCase() === "invalid";
    if (!statusInvalid && !resubmitMode) {
      toast.error("Chỉ xe bị từ chối mới có thể nộp lại đơn.");
      return;
    }

    // Validate all fields
    if (!validateAllEdit()) {
      toast.error("Vui lòng sửa các trường bị lỗi trước khi gửi lại.");
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        name: editName.trim(),
        licensePlates: editPlate.trim(),
        VIN: editVIN.trim(),
        modelId: editModelId,
        validatedImage: cavetUrl,
      };
      await api.post(`/vehicles`, payload, { withCredentials: true });
      toast.success("Gửi lại yêu đăng ký xe thành công");
      setEditOpen(false);
      setResubmitMode(false);
      fetchVehicles();
    } catch (err: any) {
      console.error(err);
      const status = err.response?.status;

      if (status === 400) {
        toast.error("Xe này đã được đăng ký trước đó.");
      } else if (status === 401) {
        toast.error(
          "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (status === 404) {
        toast.error("Không tìm thấy thông tin cần thiết. Vui lòng thử lại sau.");
      } else {
        toast.error(
          "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau ít phút."
        );
      }
    } finally {
      setEditLoading(false);
    }
  };

  // General save handler
  const handleSaveEdit = () => {
    if (resubmitMode) {
      handleResubmitVehicle();
    } else {
      handleUpdateVehicle();
    }
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      toast.info("Đang tải ảnh lên cloud...");

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append("file", file);
      if (uploadPreset) formData.append("upload_preset", uploadPreset);
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
      // validate cavet when uploaded
      validateField("cavet", data.secure_url);
      toast.success("Tải ảnh cavet thành công!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Không thể tải ảnh cavet lên cloud!");
      setCavetUrl(undefined);
    } finally {
      setUploading(false);
    }
  };

  // Validate a single field for the edit modal
 function validateField(name: string, value: string | undefined | null) {
   const statusInvalid = editVehicle?.status.toLowerCase() === "invalid";
   const statusActive = editVehicle?.status.toLowerCase() === "active";

   switch (name) {
     case "name":
       if (value && value.length > 100)
         setNameError("Tên xe không quá 100 ký tự");
       else setNameError(null);
       break;

     case "plate":
       if (statusActive) {
         // khi xe active, plate không edit, không báo lỗi
         setPlateError(null);
       } else {
         if (!value || !value.trim()) setPlateError("Vui lòng nhập biển số");
         else if (!/^[A-Z0-9 .-]+$/.test(value.trim()))
           setPlateError("Biển số không hợp lệ (không chứa ký tự đặc biệt)");
         else setPlateError(null);
       }
       break;

     case "vin":
       if (statusInvalid || resubmitMode) {
         if (!value || !value.trim())
           setVinError("Vui lòng nhập số khung (VIN)");
         else if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(value.trim()))
           setVinError(
             "VIN không hợp lệ (17 ký tự chữ hoa và số, không chứa I/O/Q)"
           );
         else setVinError(null);
       } else {
         setVinError(null);
       }
       break;

     case "model":
       if (statusInvalid || resubmitMode) {
         if (!value) setModelError("Vui lòng chọn model");
         else setModelError(null);
       } else {
         setModelError(null);
       }
       break;

     case "cavet":
       if (statusInvalid || resubmitMode) {
         if (!value) setCavetError("Vui lòng tải ảnh cavet");
         else setCavetError(null);
       } else {
         setCavetError(null);
       }
       break;

     default:
       break;
   }
 }

  // Validate all edit fields before saving. Returns true when valid.
  function validateAllEdit(): boolean {
    let valid = true;
    const statusInvalid =
      editVehicle?.status.toLowerCase() === "invalid" && !resubmitMode;
    const statusActive =
      editVehicle?.status.toLowerCase() === "active" && !resubmitMode;

    // If active, only name can be edited
    if (statusActive) {
      if (editName && editName.length > 100) {
        setNameError("Tên xe không quá 100 ký tự");
        valid = false;
      }
      return valid;
    }

    // Otherwise validate plate and other fields as before
    validateField("plate", editPlate);
    if (!editPlate || !editPlate.trim()) valid = false;

    if (statusInvalid) {
      if (!editModelId) {
        setModelError("Vui lòng chọn model");
        valid = false;
      }
      if (!cavetUrl) {
        setCavetError("Vui lòng tải ảnh cavet");
        valid = false;
      }
      if (!editVIN || !editVIN.trim()) {
        setVinError("Vui lòng nhập số khung (VIN)");
        valid = false;
      }
    }

    // name length check
    if (editName && editName.length > 100) {
      setNameError("Tên xe không quá 100 ký tự");
      valid = false;
    }

    return valid;
  }

  // Open confirm modal
  const openConfirmModal = (v: Vehicle, action: "cancel" | "relink") => {
    setConfirmVehicle(v);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  // Handle confirm action
  const handleConfirmAction = async () => {
    if (!confirmVehicle || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "cancel") {
        await api.patch(
          `/vehicles/${confirmVehicle.id}/unlink`,
          {},
          { withCredentials: true }
        );
        toast.success("Hủy liên kết thành công");
      } else {
        await api.post(
          "/vehicles",
          {
            name: confirmVehicle.name,
            licensePlates: confirmVehicle.licensePlates,
            VIN: confirmVehicle.VIN,
            modelId: confirmVehicle.model?.id,
            validatedImage: confirmVehicle.validatedImage,
          },
          { withCredentials: true }
        );
        toast.success("Gửi lại yêu cầu liên kết thành công");
      }
      fetchVehicles();
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="flex h-full bg-[#E9F8F8] min-h-[80vh] max-h-[90vh]">
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl text-center font-semibold mb-8 text-[#38A3A5]">
          Danh sách xe của tôi
        </h1>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { label: "Tất cả", value: "all" },
            { label: "Đang chờ duyệt", value: "pending" },
            { label: "Đã duyệt", value: "active" },
            { label: "Từ chối", value: "invalid" },
          ].map((btn) => (
            <Button
              key={btn.value}
              onClick={() => setFilterStatus(btn.value)}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-all ${
                filterStatus === btn.value
                  ? "bg-[#38A3A5] text-white border-[#38A3A5] shadow-md"
                  : "bg-white text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5]/10"
              }`}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Vehicle list */}
        {loading ? (
          <div className="text-center text-gray-500 mt-10 animate-pulse">
            Đang tải danh sách xe...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Không có xe nào trong trạng thái này.
          </div>
        ) : (
          <div className="grid gap-6 justify-center grid-cols-[repeat(auto-fit,minmax(280px,450px))]">
            {filteredVehicles.map((v) => {
              const s = renderStatus(v.status);
              return (
                <Card
                  key={v.id}
                  className="p-5 bg-white border border-[#BCE7E8] rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="space-y-1 text-sm text-gray-700">
                    <h2 className="text-lg font-semibold text-[#38A3A5] mb-2">
                      {v.name || "Không có tên"}
                    </h2>
                    <p>Biển số: {v.licensePlates || "Không rõ"}</p>
                    <p>Loại xe: {v.model?.name || "Không rõ"}</p>
                    <p>Loại pin: {v.model?.batteryType?.name || "Không rõ"}</p>
                    <p className="truncate">VIN: {v.VIN || "Không rõ"}</p>
                    <p className={`font-medium ${s.color}`}>
                      Trạng thái: {s.label}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between items-center gap-2 mt-4 border-t border-[#DFF6F6] pt-3">
                    {v.status.toLowerCase() !== "pending" &&
                      v.status.toLowerCase() !== "invalid" && (
                        <Button
                          variant="outline"
                          onClick={() => openEditModal(v)}
                          className="flex-1 text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
                        >
                          Cập nhật
                        </Button>
                      )}
                    {v.status.toLowerCase() !== "inactive" && (
                      <>
                        {v.status.toLowerCase() === "invalid" && (
                          <Button
                            variant="outline"
                            onClick={() => openEditModal(v, true)}
                            className="flex-1 text-[#F59E0B] border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white transition-all"
                          >
                            Đăng ký lại
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => openConfirmModal(v, "cancel")}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        >
                          Hủy liên kết
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setResubmitMode(false);
          }}
        >
          <DialogContent className="w-full max-w-7xl bg-white rounded-2xl shadow-xl border border-[#BCE7E8] p-6">
            <div className="overflow-y-auto max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-[#38A3A5]">
                  {resubmitMode
                    ? "Nộp lại đơn đăng ký xe"
                    : "Cập nhật thông tin xe"}
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Vui lòng kiểm tra kỹ trước khi lưu thay đổi.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4 border-b border-[#DFF6F6] pb-4">
                <h3 className="text-[#38A3A5] font-semibold">
                  Thông tin cơ bản
                </h3>
                <div>
                  <Label className="text-[#38A3A5] font-medium">Tên xe</Label>
                  <Input
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      validateField("name", e.target.value);
                    }}
                    placeholder="Nhập tên xe"
                    className="mt-1"
                    disabled={
                      !resubmitMode &&
                      editVehicle?.status.toLowerCase() === "pending"
                    }
                  />
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1">{nameError}</p>
                  )}
                </div>
                {(editVehicle?.status.toLowerCase() !== "active" ||
                  resubmitMode) && (
                  <div>
                    <Label className="text-[#38A3A5] font-medium">
                      Biển số
                    </Label>
                    <Input
                      value={editPlate}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase();
                        setEditPlate(v);
                        validateField("plate", v);
                      }}
                      disabled={
                        !resubmitMode &&
                        editVehicle?.status.toLowerCase() === "pending"
                      }
                      placeholder="Nhập biển số"
                      className="mt-1"
                    />
                    {plateError && (
                      <p className="text-red-500 text-sm mt-1">{plateError}</p>
                    )}
                  </div>
                )}{" "}
                {(editVehicle?.status.toLowerCase() === "invalid" ||
                  resubmitMode) && (
                  <>
                    <div>
                      <Label className="text-[#38A3A5] font-medium">
                        Số khung (VIN)
                      </Label>
                      <Input
                        value={editVIN}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          setEditVIN(v);
                          validateField("vin", v);
                        }}
                        placeholder="Nhập số khung (VIN)"
                        className={"mt-1 " + (vinError ? "border-red-500" : "")}
                        disabled={
                          !resubmitMode &&
                          editVehicle?.status.toLowerCase() === "pending"
                        }
                      />
                      {vinError && (
                        <p className="text-red-500 text-sm mt-1">{vinError}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-[#38A3A5] font-medium">
                        Chọn model *
                      </Label>
                      <select
                        className={
                          "w-full border rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5] outline-none " +
                          (modelError ? "border-red-500" : "border-[#BCE7E8]")
                        }
                        onChange={(e) => {
                          setEditModelId(e.target.value);
                          validateField("model", e.target.value);
                        }}
                        value={editModelId}
                        required
                        disabled={
                          !resubmitMode &&
                          editVehicle?.status.toLowerCase() === "pending"
                        }
                      >
                        <option value="">-- Chọn model --</option>
                        {loadingModels ? (
                          <option disabled>Đang tải...</option>
                        ) : (
                          models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))
                        )}
                      </select>
                      {modelError && (
                        <p className="text-red-500 text-sm mt-1">
                          {modelError}
                        </p>
                      )}
                    </div>

                    {/* Ảnh cavet mới */}
                    <div className="mt-4 flex flex-col items-start justify-start">
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
                        disabled={
                          uploading ||
                          (!resubmitMode &&
                            editVehicle?.status.toLowerCase() === "pending")
                        }
                      />

                      {cavetError && (
                        <p className="text-red-500 text-sm mt-2">
                          {cavetError}
                        </p>
                      )}

                      <div className="mt-4 relative w-full max-w-md h-48 border border-dashed border-[#BCE7E8] rounded-lg overflow-hidden">
                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt="Cavet Preview"
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPreview(undefined);
                                setCavetUrl(undefined);
                                validateField("cavet", undefined);
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
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="mt-6 flex justify-start gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="border-[#38A3A5] text-[#38A3A5] hover:bg-[#38A3A5]/10"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={
                    editLoading ||
                    uploading ||
                    (!resubmitMode &&
                      editVehicle?.status.toLowerCase() === "pending")
                  }
                  className="bg-[#38A3A5] hover:bg-[#2E8788] text-white"
                >
                  {editLoading || uploading
                    ? "Đang lưu..."
                    : !resubmitMode &&
                      editVehicle?.status.toLowerCase() === "pending"
                    ? "Không thể chỉnh"
                    : resubmitMode
                    ? "Đăng ký lại"
                    : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Modal */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#38A3A5] text-lg font-semibold">
                {confirmAction === "cancel"
                  ? "Xác nhận hủy liên kết"
                  : "Xác nhận gửi lại yêu cầu đăng ký xe"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {confirmAction === "cancel"
                  ? "Bạn có chắc muốn hủy liên kết phương tiện này?"
                  : "Bạn có muốn gửi lại yêu cầu đăng ký xe để admin duyệt?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleConfirmAction} disabled={confirmLoading}>
                {confirmLoading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
