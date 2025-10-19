import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminUserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const userData = [
        {
            id: "U001",
            name: "Nguyễn Văn A",
            email: "a.nguyen@example.com",
            role: "Admin",
            status: "Active",
            registerDate: "2023-05-10",
        },
        {
            id: "U002",
            name: "Trần Thị B",
            email: "b.tran@example.com",
            role: "Staff",
            status: "Inactive",
            registerDate: "2024-01-20",
        },
        {
            id: "U003",
            name: "Lê Văn C",
            email: "c.le@example.com",
            role: "Staff",
            status: "Active",
            registerDate: "2023-12-15",
        },
        {
            id: "U004",
            name: "Phạm Thị D",
            email: "d.pham@example.com",
            role: "Admin",
            status: "Active",
            registerDate: "2024-02-05",
        },
    ];

    const filteredUsers = userData.filter(
        (u) =>
            u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 min-h-screen">
            <h2 className="text-center text-2xl font-bold text-[#38A3A5]">Quản lý Người dùng</h2>

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

                    <button
                        onClick={() => setSearchTerm("")}
                        className="bg-[#38A3A5] text-white px-3 py-1 rounded hover:bg-[#246B45] text-sm"
                    >
                        Lọc
                    </button>

                    <span className="ml-auto font-semibold text-sm">
                        Số lượng: {filteredUsers.length}
                    </span>
                </div>

                {/* Table */}
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
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((u, idx) => (
                                <tr key={u.id} className="border-b hover:bg-gray-100">
                                    <td className="px-2 py-1">{idx + 1}</td>
                                    <td className="px-2 py-1">{u.id}</td>
                                    <td className="px-2 py-1">{u.name}</td>
                                    <td className="px-2 py-1">{u.email}</td>
                                    <td className="px-2 py-1">{u.role}</td>
                                    <td className="px-2 py-1">{u.status}</td>

                                    {/* Hành động */}
                                    <td className="px-2 py-1 flex flex-row gap-2 justify-center">
                                        <button
                                            className="text-indigo-600 hover:underline"
                                            onClick={() => setSelectedUser(u)}
                                        >
                                            Xem chi tiết
                                        </button>
                                        <button
                                            className="text-green-600 hover:underline"
                                            onClick={() => alert(`Cập nhật người dùng ${u.id}`)}
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline"
                                            onClick={() => alert(`Xóa người dùng ${u.id}`)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-500">
                                    Không tìm thấy người dùng phù hợp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal chi tiết */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Thông tin chi tiết người dùng</DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p>
                                <strong>ID:</strong> {selectedUser.id}
                            </p>
                            <p>
                                <strong>Họ & Tên:</strong> {selectedUser.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedUser.email}
                            </p>
                            <p>
                                <strong>Vai trò:</strong> {selectedUser.role}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong> {selectedUser.status}
                            </p>
                            <p>
                                <strong>Ngày đăng ký:</strong> {selectedUser.registerDate}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
