import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Vehicle {
  id: string;
  licensePlates: string;
  VIN: string;
  status: string;
  model?: {
    id: string;
    name: string;
    brand?: string;
    batteryType?: {
      id: string;
      name: string;
    };
  };
  name?: string;
  batteryId?: string;
}

export default function MyVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // modal edit
  const [editOpen, setEditOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [editVIN, setEditVIN] = useState("");
  const [editModelId, setEditModelId] = useState<string | undefined>();
  const [editLoading, setEditLoading] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "relink" | null
  >(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // fetch API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles", { withCredentials: true });
      setVehicles(res.data.data?.vehicles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const res = await api.get("/models", { withCredentials: true });
      setModels(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchModels();
  }, []);

  // render status
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

  // filter xe
  const filteredVehicles =
    filterStatus === "all"
      ? vehicles
      : vehicles.filter((v) => v.status.toLowerCase() === filterStatus);

  // mở modal edit
  const openEditModal = (v: Vehicle) => {
    setEditVehicle(v);
    setEditName(v.name || "");
    setEditPlate(v.licensePlates || "");
    setEditVIN(v.VIN || "");
    setEditModelId(v.model?.id);
    setEditOpen(true);
  };

  // lưu edit
  const handleSaveEdit = async () => {
    if (!editVehicle) return;
    setEditLoading(true);
    try {
      const payload: any = {
        name: editName.trim(),
        licensePlates: editPlate.trim(),
        VIN: editVIN.trim(),
        modelId: editModelId,
      };
      await api.patch(`/vehicles/${editVehicle.id}`, payload, {
        withCredentials: true,
      });
      toast.success("Cập nhật thông tin xe thành công");
      setEditOpen(false);
      fetchVehicles();
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setEditLoading(false);
    }
  };

  // mở confirm
  const openConfirmModal = (v: Vehicle, action: "cancel" | "relink") => {
    setConfirmVehicle(v);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  // xác nhận hành động
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
    <div className="flex h-full bg-[#E9F8F8] min-h-[80vh] max-h-[90vh] overflow-y-auto">
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-3xl text-center font-semibold mb-8 text-[#38A3A5]">
          Danh sách xe của tôi
        </h1>

        {/* Bộ lọc trạng thái */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { label: "Tất cả", value: "all" },
            { label: "Đang chờ duyệt", value: "pending" },
            { label: "Đã duyệt", value: "active" },
            { label: "Từ chối", value: "invalid" },
            { label: "Đã hủy", value: "inactive" },
          ].map((btn) => (
            <Button
              key={btn.value}
              onClick={() => setFilterStatus(btn.value)}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-all
        ${
          filterStatus === btn.value
            ? "bg-[#38A3A5] text-white border-[#38A3A5] shadow-md"
            : "bg-white text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5]/10"
        }`}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* DANH SÁCH XE */}
        {loading ? (
          <div className="text-center text-gray-500 mt-10 animate-pulse">
            Đang tải danh sách xe...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Không có xe nào trong trạng thái này.
          </div>
        ) : (
          <div className="grid gap-6 justify-start grid-cols-[repeat(auto-fit,minmax(280px,500px))]">
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

                  {/* BUTTONS */}
                  <div className="flex justify-between items-center gap-2 mt-4 border-t border-[#DFF6F6] pt-3">
                    <Button
                      variant="outline"
                      onClick={() => openEditModal(v)}
                      className="flex-1 text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
                    >
                      Cập nhật
                    </Button>
                    {v.status.toLowerCase() !== "inactive" && (
                      <>
                        {v.status.toLowerCase() === "invalid" && (
                          <Button
                            variant="outline"
                            onClick={() => openConfirmModal(v, "relink")}
                            className="flex-1 text-[#F59E0B] border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white transition-all"
                          >
                            Liên kết lại
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

        {/* Modal Cập nhật thông tin xe */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border border-[#BCE7E8]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#38A3A5]">
                Cập nhật thông tin xe
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Vui lòng kiểm tra kỹ trước khi lưu thay đổi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#38A3A5] font-medium">Tên xe</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập tên xe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-[#38A3A5] font-medium">Biển số</Label>
                <Input
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                  placeholder="Nhập biển số"
                  className="mt-1"
                />
              </div>

              {editVehicle?.status?.toLowerCase() === "invalid" && (
                <>
                  <div>
                    <Label className="text-[#38A3A5] font-medium">
                      Số khung (VIN)
                    </Label>
                    <Input
                      value={editVIN}
                      onChange={(e) => setEditVIN(e.target.value)}
                      placeholder="Nhập số khung (VIN)"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[#38A3A5] font-medium">
                      Chọn model *
                    </Label>
                    <select
                      className="w-full border border-[#BCE7E8] rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5] outline-none"
                      onChange={(e) => setEditModelId(e.target.value)}
                      value={editModelId}
                      required
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
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-[#38A3A5] text-[#38A3A5] hover:bg-[#38A3A5]/10"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="bg-[#38A3A5] hover:bg-[#2E8788] text-white"
              >
                {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL XÁC NHẬN */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#38A3A5] text-lg font-semibold">
                {confirmAction === "cancel"
                  ? "Xác nhận hủy liên kết"
                  : "Xác nhận gửi lại yêu cầu liên kết"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {confirmAction === "cancel"
                  ? "Bạn có chắc muốn hủy liên kết phương tiện này?"
                  : "Bạn có muốn gửi lại yêu cầu liên kết để admin duyệt?"}
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
