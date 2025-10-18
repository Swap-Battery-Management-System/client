import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterVehicle() {
    const [plate, setPlate] = useState("");
    const [model, setModel] = useState("");
    const [vin, setVin] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!plate || !model || !vin) {
            toast.error("Vui lòng nhập đầy đủ thông tin xe");
            return;
        }

        try {
            // TODO: gọi API đăng ký xe tại đây (VD: /vehicle/register)
            console.log("🚗 Submitting vehicle info:", { plate, model, vin });

            toast.success("Đăng ký xe thành công!");
            setPlate("");
            setModel("");
            setVin("");
        } catch (error) {
            console.error("❌ Lỗi khi đăng ký xe:", error);
            toast.error("Đăng ký xe thất bại. Vui lòng thử lại!");
        }
    };

    return (
        <div className="flex justify-center p-8">
            <div className="w-full max-w-lg">
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                    Đăng ký phương tiện
                </h1>

                <Card className="p-6 space-y-5 bg-white shadow-sm border border-gray-100 rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="plate">Biển số xe</Label>
                            <Input
                                id="plate"
                                placeholder="Nhập biển số xe (VD: 59A1-123.45)"
                                value={plate}
                                onChange={(e) => setPlate(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="model">Chọn mẫu xe</Label>
                            <select
                                id="model"
                                className="w-full border border-gray-300 rounded-md p-2 mt-1 bg-white focus:ring-2 focus:ring-emerald-500"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn model --</option>
                                <option value="Yadea G5">Yadea G5</option>
                                <option value="VinFast Feliz">VinFast Feliz</option>
                                <option value="DatBike Weaver">DatBike Weaver</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="vin">Số khung (VIN)</Label>
                            <Input
                                id="vin"
                                placeholder="Nhập số VIN"
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full mt-4">
                            Đăng ký xe
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
