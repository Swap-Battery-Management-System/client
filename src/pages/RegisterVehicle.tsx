import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Layout from "@/layout/layout";

export default function RegisterVehicle() {
    const [plate, setPlate] = useState("");
    const [model, setModel] = useState("");
    const [vin, setVin] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ plate, model, vin });
        // TODO: call API to register vehicle
    };

    return (
        <Layout>
            <div className="flex h-screen">
                {/* Sidebar nằm trong Layout rồi */}
                <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                    <h1 className="text-2xl font-semibold mb-6">Đăng ký xe</h1>
                    <Card className="max-w-lg mx-auto p-6 space-y-5 shadow-md">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Biển số xe</Label>
                                <Input
                                    placeholder="Nhập biển số xe"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label>Chọn model</Label>
                                <select
                                    className="w-full border rounded-md p-2 mt-1"
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
                                <Label>Nhập VIN</Label>
                                <Input
                                    placeholder="Nhập số VIN"
                                    value={vin}
                                    onChange={(e) => setVin(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Đăng ký thông tin xe
                            </Button>
                        </form>
                    </Card>
                </main>
            </div>
        </Layout>
    );
}
