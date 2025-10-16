import { toast } from "sonner";

interface NotifyOptions {
  title?: string;
  message: string;
}

export function useNotification() {
  const success = ({ title = "Thành công", message }: NotifyOptions) => {
    console.log("thong bao",message);
    toast.success(message, {
      description: title,
      duration: 2000,
      style: {
        background: "#E0F7FA",
        color: "#006064",
      },
    });
  };

  const error = ({ title = "Thất bại", message }: NotifyOptions) => {
    toast.error(message, {
      description: title,
      duration: 2000,
      style: {
        background: "#FFEBEE",
        color: "#B71C1C",
      },
    });
  };

  return { success, error };
}
