import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AdminUserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // ==========================
    // 🧭 1. Lấy toàn bộ users
    // ==========================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/users");

            // ✅ Lấy mảng user đúng vị trí: data.data.users
            const list = Array.isArray(res.data.data?.users)
                ? res.data.data.users
                : [];

            setUsers(list);
        } catch (err: any) {
            console.error("Fetch users error:", err);
            toast.error("Không thể tải danh sách người dùng ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ==========================
    // 🗑️ 2. Xoá user
    // ==========================
    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xoá người dùng này?")) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success("Đã xoá người dùng thành công ✅");
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            toast.error("Xoá người dùng thất bại ❌");
        }
    };

    // ==========================
    // ✏️ 3. Cập nhật thông tin user (PATCH /users/complete)
    // ==========================
    const handleUpdateProfile = async (id: string) => {
        const newName = prompt("Nhập tên mới:");
        if (!newName) return;
        try {
            await api.patch("/users/complete", {
                fullName: newName,
            });
            toast.success("Cập nhật thành công!");
            fetchUsers();
        } catch (err) {
            toast.error("Không thể cập nhật hồ sơ ❌");
        }
    };

    // ==========================
    // ➕ 4. Thêm user mới
    // ==========================
    const handleCreateUser = async () => {
        const email = prompt("Email:");
        const password = prompt("Mật khẩu:");
        if (!email || !password) return;

        try {
            const res = await api.post("/users", {
                email,
                password,
                role: "driver",
            });
            toast.success("Tạo người dùng thành công ✅");
            setUsers([...users, res.data.data]);
        } catch (err: any) {
            if (err.response?.status === 409) toast.error("Email đã tồn tại!");
            else toast.error("Không thể tạo người dùng ❌");
        }
    };

    // ==========================
    // 🔍 Lọc user theo từ khóa
    // ==========================
    const filteredUsers = users.filter(
        (u) =>
            u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ==========================
    // 📄 Hiển thị tên vai trò (từ roleId)
    // ==========================
    const getRoleName = (roleId: string) => {
        switch (roleId) {
            case "29cfa2e4-4264-4da5-9c39-ab0fa7f40599":
                return "Admin";
            case "df04443d-75f1-4ef4-a475-54627ddf2d8a":
                return "Staff";
            case "a0a2ba5c-e53a-4690-8521-bf9c2728a013":
                return "Driver";
            default:
                return "Unknown";
        }
    };

    // ==========================
    // 📄 UI Render
    // ==========================
    return (
        <div className="p-6 space-y-6 min-h-screen">
            <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
                Quản lý Người dùng
            </h2>

            <div className="p-4 space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nhập ID, tên hoặc email..."
                            className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <Button
                        onClick={() => handleCreateUser()}
                        className="bg-[#38A3A5] text-white text-sm"
                    >
                        + Thêm người dùng
                    </Button>

                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredUsers.length}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full table-auto text-center border-collapse">
                        <thead className="bg-[#E6F7F7] text-[#38A3A5]">
                            <tr>
                                {[
                                    "STT",
                                    "ID",
                                    "Họ & Tên",
                                    "Email",
                                    "Vai trò",
                                    "Trạng thái",
                                    "Hành động",
                                ].map((header) => (
                                    <th key={header} className="border px-2 py-1">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-4 text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((u, idx) => (
                                    <tr key={u.id} className="border-b hover:bg-gray-100">
                                        <td className="px-2 py-1">{idx + 1}</td>
                                        <td className="px-2 py-1">{u.id?.slice(0, 8)}</td>
                                        <td className="px-2 py-1">{u.fullName || "—"}</td>
                                        <td className="px-2 py-1">{u.email}</td>
                                        <td className="px-2 py-1">{getRoleName(u.roleId)}</td>
                                        <td className="px-2 py-1">{u.status}</td>
                                        <td className="px-2 py-1 flex flex-row gap-2 justify-center">
                                            <button
                                                className="text-indigo-600 hover:underline"
                                                onClick={() => setSelectedUser(u)}
                                            >
                                                Xem chi tiết
                                            </button>
                                            <button
                                                className="text-green-600 hover:underline"
                                                onClick={() => handleUpdateProfile(u.id)}
                                            >
                                                Cập nhật
                                            </button>
                                            <button
                                                className="text-red-600 hover:underline"
                                                onClick={() => handleDelete(u.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-4 text-gray-500">
                                        Không tìm thấy người dùng phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal chi tiết */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Thông tin chi tiết người dùng</DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Họ & Tên:</strong> {selectedUser.fullName || "—"}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Vai trò:</strong> {getRoleName(selectedUser.roleId)}</p>
                            <p><strong>Trạng thái:</strong> {selectedUser.status}</p>
                            <p><strong>Ngày sinh:</strong> {selectedUser.dateOfBirth || "—"}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
