import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
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

        // Validate
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn hình ảnh hợp lệ!");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ảnh vượt quá 2MB!");
            return;
        }

        setTempPreview(URL.createObjectURL(file));
        setUploading(true);
        toast.info("Đang tải ảnh lên Cloudinary...");

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "swapnet_avatars");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formData }
            );

            const data = await res.json();
            if (!data.secure_url) throw new Error("Upload thất bại!");

            const uploadedUrl = data.secure_url;

            onUploaded(uploadedUrl);
            toast.success("Ảnh đã tải lên Cloudinary!");

        } catch (err) {
            console.error(err);
            toast.error("Không thể tải ảnh!");
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
                    className="w-28 h-28 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                />

                {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {(preview || tempPreview) && !uploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            <label
                htmlFor="avatar-upload"
                className="flex items-center gap-2 mt-3 bg-[#57CC99] hover:bg-[#38A3A5] text-white py-1.5 px-3 rounded-md text-sm cursor-pointer"
            >
                <UploadCloud size={16} />
                {uploading ? "Đang tải..." : "Đổi ảnh"}
            </label>

            <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleImageChange}
            />
        </div>
    );
}
