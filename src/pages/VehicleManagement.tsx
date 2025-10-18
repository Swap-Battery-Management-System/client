import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/layout/layout";
import { useState } from "react";

interface Vehicle {
    id: string;
    plate: string;
    model: string;
    vin: string;
    status: string;
}

export default function VehicleManagement() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([
        { id: "V001", plate: "59A1-123.45", model: "Yadea G5", vin: "VN123ABC", status: "Hoạt động" },
        { id: "V002", plate: "59B2-678.90", model: "VinFast Feliz", vin: "VN456DEF", status: "Đang bảo trì" },
    ]);

    const handleUnlink = (id: string) => {
        if (confirm("Bạn có chắc muốn hủy liên kết xe này?")) {
            setVehicles(vehicles.filter((v) => v.id !== id));
        }
    };

    return (
        <Layout>
            <div className="flex h-screen">
                <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                    <h1 className="text-2xl font-semibold mb-6">Phương tiện của tôi</h1>

                    <div className="grid gap-4">
                        {vehicles.map((v) => (
                            <Card key={v.id} className="p-5 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-medium">Biển số xe: {v.plate}</p>
                                    <p>Model: {v.model}</p>
                                    <p>VIN: {v.vin}</p>
                                    <p className="text-sm text-gray-500">Trạng thái: {v.status}</p>
                                </div>
                                <Button variant="destructive" onClick={() => handleUnlink(v.id)}>
                                    Hủy liên kết
                                </Button>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </Layout>
    );
}
