import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Car, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function MyVehicles() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchVehicles = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await axios.get(`${API_URL}/vehicles/user/${user._id}`);
            setVehicles(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (vehicleId: string) => {
        if (!confirm("Bạn có chắc muốn hủy liên kết xe này?")) return;
        try {
            await axios.delete(`${API_URL}/vehicles/${vehicleId}`);
            setVehicles((prev) => prev.filter((v) => v.vehicle_id !== vehicleId));
        } catch {
            alert("Không thể hủy liên kết xe này.");
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-start bg-gradient-to-br from-[#38A3A5] via-[#57CC99] to-[#C7F9CC] p-6">
            <div className="bg-white/90 rounded-2xl shadow-lg w-full max-w-[800px] p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-[#38A3A5]">
                        Phương tiện của tôi
                    </h2>
                    <Button
                        className="flex items-center bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                        onClick={() => navigate("/dang-ky-xe")}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> Thêm phương tiện
                    </Button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Đang tải...</p>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-10">
                        <Car className="mx-auto text-[#38A3A5] w-12 h-12 mb-3" />
                        <p className="text-gray-600 mb-4">Bạn chưa có phương tiện nào.</p>
                        <Button
                            onClick={() => navigate("/dang-ky-xe")}
                            className="bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                        >
                            + Thêm phương tiện
                        </Button>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 text-[#38A3A5]">
                                <th className="py-2">#</th>
                                <th>Biển số xe</th>
                                <th>Model</th>
                                <th>VIN</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v, i) => (
                                <tr key={v.vehicle_id} className="border-b border-gray-100">
                                    <td className="py-2">{i + 1}</td>
                                    <td>{v.license_plate}</td>
                                    <td>{v.model}</td>
                                    <td>{v.vin}</td>
                                    <td>{v.status || "Hoạt động"}</td>
                                    <td>
                                        <Button
                                            variant="outline"
                                            className="text-red-500 border-red-400 hover:bg-red-50"
                                            onClick={() => handleUnlink(v.vehicle_id)}
                                        >
                                            Hủy liên kết
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
