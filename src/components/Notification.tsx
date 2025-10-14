// utils/notification.ts
import { toast } from "sonner";

interface NotifyOptions {
  title?: string;
  message: string;
}

export const Notification = {
  success: ({ title = "Thành công", message }: NotifyOptions) => {
    toast.success(message, {
      description: title,
      duration:3000,
      style: {
        background: "#E0F7FA",
        color: "#006064",
      },
    });
  },

  error: ({ title = "Thất bại", message }: NotifyOptions) => {
    toast.error(message, {
      description: title,
      style: {
        background: "#FFEBEE", 
        color: "#B71C1C", 
      },
    });
  },
};
