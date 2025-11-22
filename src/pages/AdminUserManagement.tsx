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
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminUserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [filterRole, setFilterRole] =
        useState<"Driver" | "Staff" | "Manager">("Driver");

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: string | null }>({
        open: false,
        userId: null,
    });

    const { user } = useAuth();
    const currentUserRole = user?.role?.name || "unknown";

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/users");
            const list = Array.isArray(res.data.data?.users) ? res.data.data.users : [];
            setUsers(list);
        } catch {
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

    // Role mapping
    const getRoleName = (roleId: string) => {
        switch (roleId) {
            case "29cfa2e4-4264-4da5-9c39-ab0fa7f40599":
                return "Admin";
            case "df04443d-75f1-4ef4-a475-54627ddf2d8a":
                return "Staff";
            case "a0a2ba5c-e53a-4690-8521-bf9c2728a013":
                return "Driver";
            case "5ddb7abd-2667-4fc0-b041-8450a1e4ab61":
                return "Manager";
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

    // Toggle status
    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "banned" : "active";

        const confirmChange = confirm(
            `Bạn có chắc chắn muốn đổi trạng thái người dùng sang "${newStatus}" không?`
        );
        if (!confirmChange) return;

        try {
            await api.patch(`/users/${userId}/status`, { status: newStatus });

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, status: newStatus } : u
                )
            );

            toast.success(`Đã đổi trạng thái thành "${newStatus}"`);
        } catch {
            toast.error("Không thể cập nhật trạng thái!");
        }
    };

    // Modal create
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({
        email: "",
        password: "",
        username: "",
        fullName: "",
    });

    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
    const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
    const [showPassword, setShowPassword] = useState(false);
    const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignUser, setAssignUser] = useState<any>(null);

    const [assignRole, setAssignRole] = useState<"staff" | "manager">("staff");

    const [stations, setStations] = useState<any[]>([]);
    const [selectedStation, setSelectedStation] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);
    const fetchStations = async () => {
        try {
            const res = await api.get("/stations");
            setStations(res.data.data?.stations || []);
        } catch {
            toast.error("Không thể tải danh sách trạm ❌");
        }
    };
    useEffect(() => {
        if (currentUserRole === "manager") {
            setFilterRole("Staff");
        }
    }, [currentUserRole]);

    return (
        <div className="p-6 space-y-6 min-h-screen">
            {/* header */}
            <h2 className="text-center text-2xl font-bold text-[#38A3A5]">
                Quản lý Người dùng
            </h2>

            {/* Search + Tabs */}
            <div className="p-4 space-y-4">

                {/* Tabs */}
                <div className="flex justify-center">
                    <div className="flex gap-2 p-1 rounded-full border border-[#38A3A5] bg-white shadow-sm">

                        {["Driver", "Staff", "Manager"]
                            .filter((role) => {

                                if (currentUserRole === "manager") {
                                    return role === "Staff";
                                }
                                return true;
                            })
                            .map((role) => (
                                <Button
                                    key={role}
                                    onClick={() => setFilterRole(role as any)}
                                    className={`rounded-full text-sm px-6 py-2 ${filterRole === role
                                        ? "bg-[#38A3A5] text-white"
                                        : "bg-white text-[#38A3A5]"
                                        }`}
                                >
                                    {role}
                                </Button>
                            ))}
                    </div>

                </div>

                {/* Search + Add */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nhập ID, tên hoặc email..."
                            className="border rounded pl-8 pr-2 py-1 w-full text-sm"
                        />
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {filterRole === "Staff" && currentUserRole === "admin" && (
                        <Button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-[#38A3A5] text-white"
                        >
                            + Thêm nhân viên
                        </Button>
                    )}
                    {filterRole === "Manager" && currentUserRole === "admin" && (
                        <Button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-[#38A3A5] text-white"
                        >
                            + Thêm quản lý
                        </Button>
                    )}


                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredUsers.length}
                    </span>
                </div>

                {/* Table */}
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
                                                <td>{idx + 1}</td>
                                                <td>{u.id?.slice(0, 8)}</td>
                                                <td>{u.fullName || "—"}</td>
                                                <td className="text-left">{u.email}</td>
                                                <td>{getRoleName(u.roleId)}</td>

                                                {/* Status */}
                                                <td>
                                                    <div
                                                        className={`inline-block rounded-md px-2 py-1 border ${u.status === "active"
                                                            ? "bg-green-100 text-green-700 border-green-300"
                                                            : u.status === "banned"
                                                                ? "bg-red-100 text-red-700 border-red-300"
                                                                : "bg-blue-100 text-blue-700 border-blue-300"
                                                            }`}
                                                    >
                                                        {u.status === "pending" ? (
                                                            <span className="text-sm font-medium">Pending</span>
                                                        ) : (
                                                            <select
                                                                value={u.status}
                                                                onChange={() =>
                                                                    handleToggleStatus(u.id, u.status)
                                                                }
                                                                className="bg-transparent outline-none cursor-pointer"
                                                            >
                                                                <option value={u.status}>
                                                                    {u.status === "active" ? "Active" : "Banned"}
                                                                </option>
                                                                <option value={u.status === "active" ? "banned" : "active"}>
                                                                    {u.status === "active" ? "Banned" : "Active"}
                                                                </option>
                                                            </select>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="flex gap-4 justify-center text-xl">
                                                    <LuDelete
                                                        className="cursor-pointer text-red-600 hover:text-red-800"
                                                        onClick={() =>
                                                            setDeleteConfirm({ open: true, userId: u.id })
                                                        }
                                                    />
                                                    <IoIosInformationCircleOutline
                                                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                                                        onClick={() => setSelectedUser(u)}
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

            {/* Delete Popup */}
            <Dialog open={deleteConfirm.open} onOpenChange={() => setDeleteConfirm({ open: false, userId: null })}>
                <DialogContent className="sm:max-w-[400px] text-center">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 font-bold">Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-700 text-sm mt-2">
                        Hành động này sẽ xóa vĩnh viễn tài khoản. Bạn có chắc không?
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </Button>
                        <Button
                            onClick={() => setDeleteConfirm({ open: false, userId: null })}
                            className="bg-gray-200 text-gray-700"
                        >
                            Hủy
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal chi tiết */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="!w-[95vw] !max-w-[1500px] !h-[90vh] overflow-y-auto p-10">
                    {selectedUser && (
                        <AdminUpdateInfoUser
                            userId={selectedUser.id}
                            onSuccess={() => {
                                fetchUsers();
                                setSelectedUser(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal tạo nhân viên */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">

                    <DialogHeader>
                        <DialogTitle className="text-[#38A3A5] font-bold text-lg">
                            Tạo nhân viên mới
                        </DialogTitle>
                    </DialogHeader>

                    {/* FORM */}
                    <div className="space-y-3 mt-3">

                        {/* Họ tên */}
                        <div>
                            <label className="block text-sm font-medium">Họ và tên</label>
                            <input
                                type="text"
                                value={newStaff.fullName}
                                onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                                placeholder="VD: Nguyễn Văn A"
                                className="border rounded-md w-full px-3 py-1"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium">Tên đăng nhập</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newStaff.username}
                                    onChange={async (e) => {
                                        const value = e.target.value.trim();
                                        setNewStaff({ ...newStaff, username: value });

                                        if (!value) {
                                            setUsernameStatus("invalid");
                                            setUsernameErrors(["Vui lòng nhập tên đăng nhập"]);
                                            return;
                                        }

                                        const errors: string[] = [];

                                        if (!/^[a-zA-Z]/.test(value)) {
                                            errors.push("Phải bắt đầu bằng chữ cái");
                                        }

                                        if (value.length < 5 || value.length > 20) {
                                            errors.push("Độ dài phải từ 5–20 ký tự");
                                        }

                                        if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
                                            errors.push("Chỉ được chứa chữ, số, _ và .");
                                        }

                                        if (errors.length > 0) {
                                            setUsernameStatus("invalid");
                                            setUsernameErrors(errors);
                                            return;
                                        }

                                        setUsernameStatus("checking");
                                        setUsernameErrors([]);

                                        try {
                                            const res = await api.post("/auth/check", { username: value });
                                            if (res.status === 200) setUsernameStatus("taken");
                                        } catch (err: any) {
                                            if (err.response?.status === 404) setUsernameStatus("available");
                                        }
                                    }}
                                    placeholder="VD: staff001"
                                    className="border rounded-md w-full px-3 py-1 pr-10"
                                />

                                {usernameStatus === "checking" && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin">⏳</span>
                                )}
                                {usernameStatus === "available" && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {usernameStatus === "taken" && (
                                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>

                            {usernameStatus === "invalid" && usernameErrors.length > 0 && (
                                <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                                    {usernameErrors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={newStaff.email}
                                    onChange={async (e) => {
                                        const value = e.target.value.trim();
                                        setNewStaff({ ...newStaff, email: value });

                                        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
                                            setEmailStatus("invalid");
                                            return;
                                        }

                                        setEmailStatus("checking");

                                        try {
                                            const res = await api.post("/auth/check", { email: value });
                                            if (res.status === 200) setEmailStatus("taken");
                                        } catch (err: any) {
                                            if (err.response?.status === 404) setEmailStatus("available");
                                        }
                                    }}
                                    placeholder="VD: staff@example.com"
                                    className="border rounded-md w-full px-3 py-1"
                                />

                                {emailStatus === "checking" && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin">⏳</span>
                                )}
                                {emailStatus === "available" && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {emailStatus === "taken" && (
                                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Mật khẩu</label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newStaff.password}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setNewStaff({ ...newStaff, password: value });
                                    }}
                                    placeholder="Nhập mật khẩu"
                                    className="border rounded-md w-full px-3 py-1 pr-10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    👁
                                </button>
                            </div>

                            {/* Thông báo lỗi mật khẩu */}
                            {newStaff.password && (
                                <ul className="text-xs text-red-500 mt-1 space-y-1">
                                    {!/.{8,}/.test(newStaff.password) && (
                                        <li>• Mật khẩu phải có ít nhất 8 ký tự</li>
                                    )}
                                    {!/[A-Z]/.test(newStaff.password) && (
                                        <li>• Phải có ít nhất 1 chữ in hoa (A–Z)</li>
                                    )}
                                    {!/[a-z]/.test(newStaff.password) && (
                                        <li>• Phải có ít nhất 1 chữ thường (a–z)</li>
                                    )}
                                    {!/[0-9]/.test(newStaff.password) && (
                                        <li>• Phải có ít nhất 1 chữ số (0–9)</li>
                                    )}
                                    {!/[!@#$%^&*(),.?":{}|<>]/.test(newStaff.password) && (
                                        <li>• Phải có ít nhất 1 ký tự đặc biệt</li>
                                    )}
                                </ul>
                            )}
                        </div>


                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-5">
                        <Button className="bg-gray-200 text-gray-700" onClick={() => setCreateModalOpen(false)}>
                            Hủy
                        </Button>

                        <Button
                            disabled={
                                !newStaff.fullName.trim() ||
                                usernameStatus !== "available" ||
                                emailStatus !== "available" ||
                                !/.{8,}/.test(newStaff.password)
                            }
                            className="bg-[#38A3A5] text-white"
                            onClick={async () => {
                                try {
                                    const roleId =
                                        filterRole === "Staff"
                                            ? "df04443d-75f1-4ef4-a475-54627ddf2d8a"
                                            : "5ddb7abd-2667-4fc0-b041-8450a1e4ab61";

                                    setAssignRole(filterRole === "Staff" ? "staff" : "manager");

                                    const res = await api.post("/users", { ...newStaff, roleId });

                                    toast.success("Tạo nhân viên thành công!");

                                    const createdStaff = res.data.data?.user || res.data.data;

                                    fetchStations();
                                    setAssignUser(createdStaff);
                                    setAssignModalOpen(true);
                                    setCreateModalOpen(false);
                                    fetchUsers();


                                    setNewStaff({
                                        email: "",
                                        password: "",
                                        username: "",
                                        fullName: "",
                                    });

                                    setUsernameStatus("idle");
                                    setEmailStatus("idle");
                                } catch {
                                    toast.error("Không thể tạo hoặc gán nhân viên!");
                                }
                            }}
                        >
                            Tạo nhân viên
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            v{/* Modal phân công nhân viên */}
            <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#38A3A5] font-bold text-lg">
                            {assignRole === "staff"
                                ? "Phân công nhân viên vào trạm"
                                : "Phân công quản lý vào trạm"}
                        </DialogTitle>
                    </DialogHeader>

                    {assignUser ? (
                        <div className="space-y-4 mt-2">
                            <p className="text-sm">
                                <strong>Nhân viên:</strong> {assignUser.fullName} <br />
                                <strong>Email:</strong> {assignUser.email}
                            </p>

                            {/* Dropdown station */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Chọn trạm</label>
                                <select
                                    value={selectedStation}
                                    onChange={(e) => setSelectedStation(e.target.value)}
                                    className="border rounded-md w-full px-3 py-2"
                                >
                                    <option value="">-- Chọn trạm --</option>
                                    {stations.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — {s.address}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Button assign */}
                            <div className="flex justify-end mt-4">
                                <Button
                                    disabled={!selectedStation || assignLoading}
                                    className="bg-[#38A3A5] text-white"
                                    onClick={async () => {
                                        try {
                                            setAssignLoading(true);

                                            const endpoint =
                                                assignRole === "staff"
                                                    ? `/stations/${selectedStation}/staffs/assign`
                                                    : `/stations/${selectedStation}/managers/assign`;

                                            await api.post(endpoint, {
                                                userId: assignUser.id,
                                                startDate: new Date().toISOString(),
                                            });


                                            toast.success("Phân công nhân viên thành công!");
                                            setAssignModalOpen(false);
                                            setSelectedStation("");
                                            setAssignUser(null);
                                        } catch (err: any) {
                                            toast.error(
                                                err.response?.data?.message ||
                                                "Không thể phân công nhân viên ❌"
                                            );
                                        } finally {
                                            setAssignLoading(false);
                                        }
                                    }}
                                >
                                    {assignLoading ? "Đang xử lý..." : "Phân công"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-sm">Không có nhân viên</p>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
