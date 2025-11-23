"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

interface DamageFee {
    id: string;
    name: string;
    severity: string;
    amount: number | string;
    unit: string;
    status: boolean;
    type: string;
    code: string;
    variant: string;
}

export default function ManagerDamageFeeManagement() {
    const [fees, setFees] = useState<DamageFee[]>([]);
    const [filtered, setFiltered] = useState<DamageFee[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        severity: "",
        type: "",
        variant: "",
        status: "",
    });

    // 🔹 Fetch danh sách phí
    const fetchFees = async () => {
        try {
            setLoading(true);
            const res = await api.get("/damage-fees");
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setFees(list);
            setFiltered(list);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách phí hư hại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    // 🔍 Lọc dữ liệu (tìm kiếm + filter)
    useEffect(() => {
        const timer = setTimeout(() => {
            const text = search.toLowerCase();
            const result = fees.filter((f) => {
                const matchesSearch =
                    !search ||
                    f.name.toLowerCase().includes(text) ||
                    f.code.toLowerCase().includes(text) ||
                    f.type.toLowerCase().includes(text);

                const matchesSeverity = !filters.severity || f.severity === filters.severity;
                const matchesType = !filters.type || f.type === filters.type;
                const matchesVariant = !filters.variant || f.variant === filters.variant;
                const matchesStatus =
                    !filters.status ||
                    (filters.status === "active" && f.status) ||
                    (filters.status === "inactive" && !f.status);

                return (
                    matchesSearch &&
                    matchesSeverity &&
                    matchesType &&
                    matchesVariant &&
                    matchesStatus
                );
            });

            setFiltered(result);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fees, filters]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-center mb-4 text-[#38A3A5]">
                Danh sách Phí Hư Hại (Damage Fees)
            </h2>

            {/* Search */}
            <div className="flex items-center gap-3 mb-4">
                <Input
                    placeholder="Tìm kiếm theo tên, code, hoặc type..."
                    className="w-1/3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                <select
                    className="border rounded-md p-2 w-[150px]"
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                >
                    <option value="">Mức độ</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>

                <select
                    className="border rounded-md p-2 w-[160px]"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">Loại</option>
                    <option value="internal_force">Internal Force</option>
                    <option value="external_force">External Force</option>
                </select>

                <select
                    className="border rounded-md p-2 w-[150px]"
                    value={filters.variant}
                    onChange={(e) => setFilters({ ...filters, variant: e.target.value })}
                >
                    <option value="">Pin</option>
                    <option value="LFP">LFP</option>
                    <option value="LIB">LIB</option>
                </select>

                <select
                    className="border rounded-md p-2 w-[150px]"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">Trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <Button
                    variant="outline"
                    className="border-[#38A3A5] text-[#38A3A5] hover:bg-[#38A3A5] hover:text-white"
                    onClick={() => setFilters({ severity: "", type: "", variant: "", status: "" })}
                >
                    Đặt lại
                </Button>
            </div>

            <div className="flex justify-end mb-2 font-semibold text-sm text-gray-600">
                Tổng: {filtered.length}
            </div>

            {/* Table */}
            <Card className="p-4 shadow-md overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#eafaf9] text-[#38A3A5] font-semibold">
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Tên phí</th>
                            <th className="border p-2">Mức độ</th>
                            <th className="border p-2">Số tiền</th>
                            <th className="border p-2">Loại</th>
                            <th className="border p-2">Code</th>
                            <th className="border p-2">Pin</th>
                            <th className="border p-2">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center p-4">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center p-4">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            filtered.map((f, i) => (
                                <tr key={f.id} className="hover:bg-[#f5fffe] border-b">
                                    <td className="border p-2 text-center">{i + 1}</td>
                                    <td className="border p-2 text-center">{f.name}</td>
                                    <td className="border p-2 text-center">{f.severity}</td>
                                    <td className="border p-2 text-center">
                                        {Number(f.amount).toLocaleString()} ₫
                                    </td>
                                    <td className="border p-2 text-center">{f.type}</td>
                                    <td className="border p-2 text-center font-mono">{f.code}</td>
                                    <td className="border p-2 text-center">{f.variant}</td>
                                    <td className="border p-2 text-center">{f.status ? "Active" : "Inactive"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
