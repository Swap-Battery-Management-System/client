import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface LocationPermissionModalProps {
  onAllow: () => void;
  onDeny: () => void;
  loading?:boolean;
}

export default function LocationPermissionModal({
  onAllow,
  onDeny,
  loading=false,
}: LocationPermissionModalProps) {
  // Tạo div cho portal
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    // disable scroll khi modal mount
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#38A3A5]">
          Cho phép truy cập vị trí?
        </h2>
        <p className="text-gray-600">
          Ứng dụng cần truy cập vị trí của bạn để hiển thị các trạm đổi pin gần
          nhất.
        </p>
        {/* Loading spinner */}
        {loading ? (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38A3A5]" />
            <span className="text-[#38A3A5]">Đang lấy vị trí...</span>
          </div>
        ) : (
          <div className="flex justify-center gap-4 pt-2">
            <Button variant="outline" onClick={onDeny}>
              Từ chối
            </Button>
            <Button
              className="bg-[#38A3A5] hover:bg-[#2e827f]"
              onClick={onAllow}
            >
              Cho phép
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
}
