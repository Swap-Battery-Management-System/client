import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { LuDelete } from "react-icons/lu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import AdminUpdateInfoUser from "@/pages/AdminUpdateInfoUser";

export default function AdminUserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [filterRole, setFilterRole] = useState<"Driver" | "Staff">("Driver");
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: string | null }>({
        open: false,
        userId: null,
    });

    // Giả lập role admin
    const currentUserRole = "admin";

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/users");
            const list = Array.isArray(res.data.data?.users) ? res.data.data.users : [];
            setUsers(list);
        } catch (err) {
            console.error("Fetch users error:", err);
            toast.error("Không thể tải danh sách người dùng ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Delete user
    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.userId) return;
        try {
            await api.delete(`/users/${deleteConfirm.userId}`);
            toast.success("Đã xoá người dùng thành công ✅");
            setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.userId));
            setDeleteConfirm({ open: false, userId: null });
        } catch {
            toast.error("Xoá người dùng thất bại ❌");
        }
    };

    // Create staff (only Admin)
    const handleCreateUser = async () => {
        if (filterRole !== "Staff") {
            toast.error("Chỉ có thể tạo nhân viên (Staff) khi đang ở tab Staff ❌");
            return;
        }
        if (currentUserRole !== "admin") {
            toast.error("Chỉ Admin được phép tạo người dùng mới ❌");
            return;
        }

        const email = prompt("Email nhân viên:");
        const password = prompt("Mật khẩu:");
        if (!email || !password) return;

        try {
            const res = await api.post("/users", {
                email,
                password,
                role: "staff",
            });
            toast.success("Tạo nhân viên (Staff) thành công ✅");
            setUsers([...users, res.data.data]);
        } catch (err: any) {
            if (err.response?.status === 409) toast.error("Email đã tồn tại!");
            else toast.error("Không thể tạo người dùng ❌");
        }
    };

    // Role mapping + filter
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

    const filteredUsers = users.filter((u) => {
        const roleName = getRoleName(u.roleId);
        const matchRole = roleName === filterRole;
        const matchSearch =
            u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchRole && matchSearch;
    });

    return (
        <div className="p-6 space-y-6 min-h-screen">
            <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
                Quản lý Người dùng
            </h2>

            <div className="p-4 space-y-4">
                {/* út chọn tab Driver / Staff */}
                <div className="flex justify-center">
                    <div className="flex gap-2 p-1 rounded-full border border-[#38A3A5] bg-white shadow-sm">
                        <Button
                            onClick={() => setFilterRole("Driver")}
                            className={`rounded-full text-sm px-6 py-2 transition-colors ${filterRole === "Driver"
                                ? "bg-[#38A3A5] text-white"
                                : "bg-white text-[#38A3A5] hover:bg-[#57CC99]/30"
                                }`}
                        >
                            Danh sách Driver
                        </Button>

                        <Button
                            onClick={() => setFilterRole("Staff")}
                            className={`rounded-full text-sm px-6 py-2 transition-colors ${filterRole === "Staff"
                                ? "bg-[#38A3A5] text-white"
                                : "bg-white text-[#38A3A5] hover:bg-[#57CC99]/30"
                                }`}
                        >
                            Danh sách Staff
                        </Button>
                    </div>
                </div>

                {/*  Search + Add user */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nhập ID, tên hoặc email..."
                            className="border rounded pl-8 pr-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#57CC99]/60"
                        />
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {filterRole === "Staff" && currentUserRole === "admin" && (
                        <Button
                            onClick={handleCreateUser}
                            className="bg-[#38A3A5] hover:bg-[#57CC99] text-white text-sm"
                        >
                            + Thêm nhân viên
                        </Button>
                    )}

                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredUsers.length}
                    </span>
                </div>

                {/*Bảng có hiệu ứng chuyển mượt */}
                <div className="overflow-x-auto border rounded-lg relative min-h-[150px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={filterRole + searchTerm}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <table className="min-w-full table-auto text-center border-collapse">
                                <thead className="bg-[#E6F7F7] text-[#38A3A5]">
                                    <tr>
                                        {["STT", "ID", "Họ & Tên", "Email", "Vai trò", "Trạng thái", "Hành động"].map(
                                            (header) => (
                                                <th key={header} className="border px-2 py-1">
                                                    {header}
                                                </th>
                                            )
                                        )}
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
                                                <td className="px-2 py-1 text-left">{u.email}</td>
                                                <td className="px-2 py-1">{getRoleName(u.roleId)}</td>
                                                <td className="px-2 py-1">{u.status}</td>
                                                <td className="px-2 py-1 flex flex-row gap-4 justify-center text-xl">
                                                    <LuDelete
                                                        className="cursor-pointer text-red-600 hover:text-red-800"
                                                        onClick={() =>
                                                            setDeleteConfirm({ open: true, userId: u.id })
                                                        }
                                                        title="Xóa người dùng"
                                                    />
                                                    <IoIosInformationCircleOutline
                                                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                                                        onClick={() => setSelectedUser(u)}
                                                        title="Xem chi tiết"
                                                    />
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Popup xác nhận xóa */}
            <Dialog open={deleteConfirm.open} onOpenChange={() => setDeleteConfirm({ open: false, userId: null })}>
                <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl shadow-lg text-center">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 font-bold">Xác nhận xóa người dùng</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-700 text-sm mt-2">
                        Hành động này sẽ <strong>xóa vĩnh viễn</strong> tài khoản người dùng.<br />
                        Bạn có chắc chắn muốn xóa không?
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xác nhận Xóa
                        </Button>
                        <Button
                            onClick={() => setDeleteConfirm({ open: false, userId: null })}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Hủy
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal chi tiết người dùng (AdminUpdateInfoUser) */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-[#38A3A5]">Thông tin chi tiết người dùng</DialogTitle>
                    </DialogHeader>
                    {selectedUser && <AdminUpdateInfoUser userId={selectedUser.id} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
