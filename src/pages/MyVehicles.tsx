import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
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
  const [editLoading, setEditLoading] = useState(false);

  // Modal xác nhận thay đổi status
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "relink" | null
  >(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Hiển thị trạng thái (label + màu)
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

  // Mở modal cập nhật thông tin (name & licensePlates)
  const openEditModal = (v: Vehicle) => {
    setEditVehicle(v);
    setEditName(v.name || "");
    setEditPlate(v.licensePlates || "");
    setEditOpen(true);
  };

  // cập nhập thông tin xe
  const handleSaveEdit = async () => {
    // if (!editVehicle) return;
    // setEditLoading(true);
    // try {
    //   await api.patch(
    //     `/vehicles/${editVehicle.id}`,
    //     {
    //       name: editName?.trim(),
    //       licensePlates: editPlate?.trim(),
    //     },
    //     { withCredentials: true }
    //   );
    //   toast.success("Cập nhật thông tin xe thành công");
    //   setEditOpen(false);
    //   fetchVehicles();
    // } catch (err) {
    //   console.error("Lỗi cập nhật thông tin xe:", err);
    //   toast.error("Cập nhật thất bại");
    // } finally {
    //   setEditLoading(false);
    // }
  };

  // Mở modal xác nhận cho actions liên quan status
  const openConfirmModal = (v: Vehicle, action: "cancel" | "relink") => {
    setConfirmVehicle(v);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  // Xử lý xác nhận: cancel => inactive, relink => pending
  const handleConfirmAction = async () => {
    // if (!confirmVehicle || !confirmAction) return;
    // setConfirmLoading(true);
    // try {
    //   const newStatus = confirmAction === "cancel" ? "inactive" : "pending";
    //   await api.put(
    //     `/vehicles/${confirmVehicle.id}/status`,
    //     { status: newStatus },
    //     { withCredentials: true }
    //   );
    //   toast.success("Cập nhật trạng thái thành công");
    //   setConfirmOpen(false);
    //   fetchVehicles();
    // } catch (err) {
    //   console.error("Lỗi khi cập nhật trạng thái:", err);
    //   toast.error("Cập nhật trạng thái thất bại");
    // } finally {
    //   setConfirmLoading(false);
    // }
  };

  // Render nút hành động theo status 
  const renderActionButton = (v: Vehicle) => {
    const s = (v.status || "").toLowerCase();
    if (s === "active" || s==="pending") {
      // active: show Huỷ liên kết
      return (
        <Button
          variant="destructive"
          onClick={() => openConfirmModal(v, "cancel")}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Hủy liên kết
        </Button>
      );
    }
    if (s === "inactive") {
      // inactive: show Liên kết lại
      return (
        <Button
          variant="outline"
          onClick={() => openConfirmModal(v, "relink")}
          className="text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
        >
          Liên kết lại
        </Button>
      );
    }
    if (s === "invalid") {
      // invalid: show Đăng ký lại (same as relink)
      return (
        <Button
          variant="outline"
          onClick={() => openConfirmModal(v, "relink")}
          className="text-[#38A3A5] border-[#38A3A5] hover:bg-[#38A3A5] hover:text-white transition-all"
        >
          Đăng ký lại
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-[#E9F8F8]">
      <main className="flex-1 p-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-[#38A3A5]">
          Danh sách xe của tôi
        </h1>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-500 mt-10 animate-pulse">
            Đang tải danh sách xe...
          </div>
        )}

        {/* Không có xe */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Bạn chưa đăng ký xe nào.
          </div>
        )}

        {/* Danh sách xe */}
        {!loading && vehicles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => {
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
                    {/* Cập nhật thông tin (name + plate) */}
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

        {/* Modal: cập nhật thông tin xe (name + licensePlates) */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#38A3A5] text-lg">
                Cập nhật thông tin xe
              </DialogTitle>
              <DialogDescription>
                Sửa tên xe và biển số 
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-3">
              <div>
                <Label className="text-[#38A3A5]">Tên xe</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tên xe (ví dụ: Xe đi làm)"
                />
              </div>

              <div>
                <Label className="text-[#38A3A5]">Biển số</Label>
                <Input
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                  placeholder="Biển số (VD: 51A-12345)"
                />
              </div>
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

        {/* Modal: xác nhận thay đổi status */}
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
