
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

export default function RegisterInfo() {
    const navigate = useNavigate();

    const handleComplete = async () => {
        try {
            await api.patch("/users/complete", {
                full_name: "Nguyễn Văn A",
                phone: "0987654321",
                address: "Hà Nội",
                gender: "male",
                birth_date: "2005-01-01",
                username: "driver001",
            });
            toast.success("Hoàn tất đăng ký thành công!");
            navigate("/login");
        } catch (err) {
            toast.error("Không thể hoàn tất đăng ký!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500">
            <Card className="w-[800px] p-6 rounded-2xl shadow-lg bg-white">
                <div className="flex justify-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-[#38A3A5] text-xl">⚡</span>
                        <span className="text-[#38A3A5]">SwapNet</span>
                    </h1>
                </div>
                <h2 className="text-3xl font-bold text-center mb-4 text-green-400">
                    Hoàn tất đăng ký
                </h2>
                <Separator className="mb-4" />

                {/* Bạn có thể giữ lại các input hiện có */}
                <div className="col-span-2 flex flex-col items-center mt-6">
                    <Button
                        className="px-2 py-1.5 mt-3 w-1/2 bg-[#57CC99] text-white hover:bg-[#38A3A5]"
                        onClick={handleComplete}
                    >
                        Hoàn tất đăng ký
                    </Button>
                </div>
            </Card>
        </div>
    );
}
