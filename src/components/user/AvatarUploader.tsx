import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function AvatarUploader({
    preview,
    onUploaded,
}: {
    preview?: string;
    onUploaded: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [tempPreview, setTempPreview] = useState<string | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra loại & kích thước
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ảnh vượt quá 2MB!");
            return;
        }

        // Hiển thị preview tạm
        setTempPreview(URL.createObjectURL(file));

        setUploading(true);
        toast.info("Đang tải ảnh lên...");

        try {
            const formData = new FormData();
            formData.append("key", "4a4efdffaf66aa2a958ea43ace6f49c1");
            formData.append("image", file);

            const res = await axios.post("https://api.imgbb.com/1/upload", formData);
            const uploadedUrl = res.data.data.url;
            onUploaded(uploadedUrl);
            toast.success("Ảnh đã tải lên thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải ảnh lên!");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setTempPreview(null);
        onUploaded("");
        toast.info("Ảnh đã được xóa!");
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
                <img
                    src={
                        tempPreview ||
                        preview ||
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover border-2 border-emerald-400 shadow-sm transition hover:opacity-90"
                />

                {/* Loading spinner */}
                {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Nút Xóa ảnh */}
                {(preview || tempPreview) && !uploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1"
                        title="Xóa ảnh"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Nút Upload */}
            <label
                htmlFor="avatar-upload"
                className="flex items-center gap-2 mt-3 bg-[#57CC99] hover:bg-[#38A3A5] text-white font-medium py-1.5 px-3 rounded-md text-sm cursor-pointer transition"
            >
                <UploadCloud size={16} />
                {uploading ? "Đang tải..." : "Đổi ảnh"}
            </label>

            <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
            />
        </div>
    );
}
