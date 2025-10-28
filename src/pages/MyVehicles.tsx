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

  // Modal cập nhật thông tin
  const [editOpen, setEditOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [editVIN, setEditVIN] = useState("");
  const [editModelId, setEditModelId] = useState<string | undefined>(undefined);
  const [editLoading, setEditLoading] = useState(false);

  // Modal xác nhận thay đổi status
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "relink" | null
  >(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [models, setModels] = useState<
    { id: string; name: string }[]
  >([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Lấy danh sách xe người dùng hiện tại
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles", { withCredentials: true });
      const data = res.data.data?.vehicles || [];
      setVehicles(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách xe:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const res = await api.get("/models", { withCredentials: true });
      const data = res.data.data || [];
      console.log(res.data);
      setModels(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách model:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchModels();
  }, []);

  // Hiển thị trạng thái
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

  // Mở modal edit
  const openEditModal = (v: Vehicle) => {
    setEditVehicle(v);
    setEditName(v.name || "");
    setEditPlate(v.licensePlates || "");
    if (v.status?.toLowerCase() === "invalid") {
      setEditVIN(v.VIN || "");
      setEditModelId(v.model?.id);
    } else {
      setEditVIN("");
      setEditModelId(undefined);
    }
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editVehicle) return;
    setEditLoading(true);
    try {
      const payload: any = {
        name: editName?.trim(),
        licensePlates: editPlate?.trim(),
      };

      if (editVehicle.status?.toLowerCase() === "invalid") {
        payload.VIN = editVIN?.trim();
        payload.modelId = editModelId;
      }

      await api.patch(`/vehicles/${editVehicle.id}`, payload, {
        withCredentials: true,
      });

      toast.success("Cập nhật thông tin xe thành công");
      setEditOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error("Lỗi cập nhật thông tin xe:", err);
      toast.error("Cập nhật thất bại");
    } finally {
      setEditLoading(false);
    }
  };

  // Xử lý modal confirm
  const openConfirmModal = (v: Vehicle, action: "cancel" | "relink") => {
    setConfirmVehicle(v);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === "cancel") handleCancel();
    else handleRelink(confirmVehicle!);
  };

  // Hủy liên kết
  const handleCancel = async () => {
    if (!confirmVehicle) return;
    setConfirmLoading(true);
    try {
      // Kiểm tra booking active
      const res = await api.get("/bookings", { withCredentials: true });
      const hasActiveBooking = res.data.data.bookings.some(
        (b: any) =>
          b.vehicleId === confirmVehicle.id && b.status === "scheduled"
      );

      if (hasActiveBooking) {
        toast.error("Xe đang trong booking, không thể hủy!");
        setConfirmLoading(false);
        setConfirmOpen(false);
        return;
      }

      await api.patch(`/vehicles/${confirmVehicle.id}/unlink`, {
        withCredentials: true,
      });

      toast.success("Hủy liên kết thành công");
      setConfirmOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error("Hủy liên kết thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Relink vehicle (tạo lại)
  const handleRelink = async (v: Vehicle) => {
    if (!v) return;
    setConfirmLoading(true);
    try {
      await api.post(
        `/vehicles`,
        {
          name: v.name,
          licensePlates: v.licensePlates,
          VIN: v.VIN,
          modelId: v.model?.id,
        },
        { withCredentials: true }
      );
      toast.success("Gửi yêu cầu liên kết thành công");
      setConfirmOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error("Liên kết lại thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Render action buttons
  const renderActionButton = (v: Vehicle) => {
    const s = v.status.toLowerCase();
    if (s === "inactive") return null;

    const buttons = [];

    if (s === "invalid") {
      buttons.push(
        <Button
          key="relink"
          variant="outline"
          onClick={() => openConfirmModal(v, "relink")}
          className="text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
        >
          Liên kết lại
        </Button>
      );
    }

    if (s !== "inactive") {
      buttons.push(
        <Button
          key="cancel"
          variant="destructive"
          onClick={() => openConfirmModal(v, "cancel")}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Hủy liên kết
        </Button>
      );
    }


    return <div className="flex gap-2">{buttons}</div>;
  };

  return (
    <div className="flex h-screen bg-[#E9F8F8]">
      <main className="flex-1 p-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
          Danh sách xe của tôi
        </h1>

        {loading && (
          <div className="text-center text-gray-500 mt-10 animate-pulse">
            Đang tải danh sách xe...
          </div>
        )}

        {!loading &&
          vehicles.filter((v) => v.status.toLowerCase() !== "inactive")
            .length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              Bạn chưa đăng ký xe nào.
            </div>
          )}

        {!loading && vehicles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles
              .filter((v) => v.status.toLowerCase() !== "inactive")
              .map((v) => {
                const s = renderStatus(v.status);
                return (
                  <Card
                    key={v.id}
                    className="p-5 bg-white/80 border border-[#BCE7E8] shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-[#38A3A5]">
                        {v.name || "Không có tên"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Biển số: {v.licensePlates || "Không rõ"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Loại xe: {v.model?.name || "Không rõ"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Loại pin: {v.model?.batteryType?.name || "Không rõ"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        Số khung (VIN): {v.VIN}
                      </p>
                      <p className={`text-sm font-medium ${s.color}`}>
                        Trạng thái: {s.label}
                      </p>
                    </div>

                    <div className="flex justify-end mt-4 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openEditModal(v)}
                        className="text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
                      >
                        Cập nhật
                      </Button>

                      {renderActionButton(v)}
                    </div>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Modal Edit */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#38A3A5] text-lg">
                Cập nhật thông tin xe
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-3">
              <div>
                <Label className="text-[#38A3A5]">Tên xe</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tên xe"
                />
              </div>

              <div>
                <Label className="text-[#38A3A5]">Biển số</Label>
                <Input
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                  placeholder="Biển số"
                />
              </div>

              {editVehicle?.status?.toLowerCase() === "invalid" && (
                <>
                  <div>
                    <Label className="text-[#38A3A5]">VIN</Label>
                    <Input
                      value={editVIN}
                      onChange={(e) => setEditVIN(e.target.value)}
                      placeholder="Số khung (VIN)"
                    />
                  </div>

                  <div>
                    <Label className="text-[#38A3A5]">Chọn model *</Label>
                    <select
                      className="w-full border border-[#BCE7E8] rounded-md p-2 mt-1 focus:ring-[#38A3A5] focus:border-[#38A3A5]"
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

            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Confirm */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {confirmAction === "cancel"
                  ? "Xác nhận hủy liên kết"
                  : "Xác nhận gửi lại yêu cầu liên kết"}
              </DialogTitle>
              <DialogDescription>
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
