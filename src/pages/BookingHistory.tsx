import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface BookingHistoryItem {
    id: string;
    customerName: string;
    station: string;
    vehicleName: string;
    batteryType: string;
    dateTime: string;
    note?: string;
    status: "Đang tiến hành" | "Đã hoàn thành" | "Hủy đặt lịch" | "Quá hạn";
}

export default function BookingHistory() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [history, setHistory] = useState<BookingHistoryItem[]>([
        {
            id: "B010",
            station: "Trạm 1",
            dateTime: "2025-10-12 14:00",
            status: "Đang tiến hành",
            customerName: "Nguyễn Như Đại",
            vehicleName: "VinFast Evo 200",
            batteryType: "Loại A",
            note: "Đến sớm 10 phút.",
        },
        {
            id: "B007",
            station: "Trạm 2",
            dateTime: "2025-10-11 09:30",
            status: "Đã hoàn thành",
            customerName: "Nguyễn Như Đại",
            vehicleName: "VinFast Feliz S",
            batteryType: "Loại B",
        },
        {
            id: "B006",
            station: "Trạm 3",
            dateTime: "2025-10-10 15:00",
            status: "Hủy đặt lịch",
            customerName: "Nguyễn Như Đại",
            vehicleName: "VinFast Klara",
            batteryType: "Loại A",
            note: "Không kịp đến trạm.",
        },
        {
            id: "B004",
            station: "Trạm 4",
            dateTime: "2025-10-09 10:00",
            status: "Quá hạn",
            customerName: "Nguyễn Như Đại",
            vehicleName: "VinFast Vento",
            batteryType: "Loại C",
        },
    ]);

    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [filterStatus, setFilterStatus] = useState<"Đang tiến hành" | "Đã kết thúc">("Đang tiến hành");
    const [sortStatus, setSortStatus] = useState<"Tất cả" | "Đã hoàn thành" | "Hủy đặt lịch" | "Quá hạn">("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [selectedBooking, setSelectedBooking] = useState<BookingHistoryItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredHistory = history
        .filter((item) => {
            let statusMatch = true;
            if (filterStatus === "Đang tiến hành") {
                statusMatch = item.status === "Đang tiến hành";
            } else if (filterStatus === "Đã kết thúc") {
                if (sortStatus === "Tất cả") {
                    statusMatch = ["Đã hoàn thành", "Hủy đặt lịch", "Quá hạn"].includes(item.status);
                } else {
                    statusMatch = item.status === sortStatus;
                }
            }

            let fromMatch = true;
            let toMatch = true;
            const itemDate = new Date(item.dateTime.split(" ")[0]);

            if (filterFrom) fromMatch = itemDate >= new Date(filterFrom);
            if (filterTo) toMatch = itemDate <= new Date(filterTo);

            return statusMatch && fromMatch && toMatch;
        })
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const displayedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleCancelBooking = (id: string) => {
        if (confirm(`Bạn có chắc muốn hủy đặt lịch ${id} không?`)) {
            setHistory((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: "Hủy đặt lịch" } : item
                )
            );
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E8F6EF] via-white to-[#EAFDF6] p-6 text-gray-800">
            <h1 className="text-5xl font-extrabold mb-6 text-center text-[#38A3A5] drop-shadow-sm">
                Lịch sử đặt lịch
            </h1>

            {/* Bộ lọc trạng thái */}
            <div className="flex justify-center mb-4">
                <div className="relative flex justify-center gap-4 mb-4 flex-wrap bg-[#C7F9CC] rounded-full p-2 w-[320px] shadow-md">
                    {["Đang tiến hành", "Đã kết thúc"].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setFilterStatus(status as any);
                                setSortStatus("Tất cả");
                                setCurrentPage(1);
                            }}
                            className={`relative z-10 flex-1 text-center py-2 text-sm font-medium transition-colors duration-200 rounded-full ${filterStatus === status
                                ? "text-white"
                                : "text-[#2D6A4F] hover:text-[#1B4332]"
                                }`}
                        >
                            {status}
                            {filterStatus === status && (
                                <motion.div
                                    layoutId="activeFilter"
                                    className="absolute inset-0 bg-gradient-to-r from-[#57CC99] to-[#38A3A5] rounded-full z-[-1]"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lọc theo ngày */}
            <div className="flex justify-center gap-2 mb-6 items-center text-[#2D6A4F]">
                <span className="font-semibold">Từ</span>
                <Input
                    type="date"
                    value={filterFrom}
                    onChange={(e) => {
                        setFilterFrom(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="max-w-[150px]"
                />
                <span>đến</span>
                <Input
                    type="date"
                    value={filterTo}
                    onChange={(e) => {
                        setFilterTo(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="max-w-[150px]"
                />
            </div>

            {/* Nút lọc trạng thái chi tiết */}
            {filterStatus === "Đã kết thúc" && (
                <div className="flex justify-center gap-2 mb-6">
                    {["Tất cả", "Đã hoàn thành", "Hủy đặt lịch", "Quá hạn"].map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={sortStatus === status ? "default" : "outline"}
                            className={sortStatus === status
                                ? "bg-gradient-to-r from-[#57CC99] to-[#38A3A5] text-white border-0"
                                : "border-[#57CC99] text-[#38A3A5] hover:bg-[#E8F6EF]"
                            }
                            onClick={() => {
                                setSortStatus(status as any);
                                setCurrentPage(1);
                            }}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            )}

            {/* Danh sách lịch sử */}
            <div className="flex flex-col gap-3 items-center">
                {displayedHistory.map((item) => (
                    <Card
                        key={item.id}
                        className="relative p-5 w-full md:w-1/2 bg-white/80 border border-[#C7F9CC] shadow-sm rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                        <div
                            className={`absolute top-3 right-4 font-medium ${item.status === "Đang tiến hành"
                                ? "text-[#2D6A4F]"
                                : item.status === "Đã hoàn thành"
                                    ? "text-green-600"
                                    : item.status === "Hủy đặt lịch"
                                        ? "text-orange-500"
                                        : "text-red-600"
                                }`}
                        >
                            {item.status}
                        </div>

                        <div className="text-[#2D6A4F]">
                            <div className="font-semibold">Mã đặt lịch: {item.id}</div>
                            <div>Tên trạm: {item.station}</div>
                            <div>Thời gian đặt lịch: {item.dateTime}</div>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-[#57CC99] to-[#38A3A5] text-white rounded-xl hover:opacity-90"
                                onClick={() => {
                                    setSelectedBooking(item);
                                    setIsModalOpen(true);
                                }}
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Phân trang */}
            <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                        key={i + 1}
                        size="sm"
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className={currentPage === i + 1
                            ? "bg-gradient-to-r from-[#57CC99] to-[#38A3A5] text-white border-0"
                            : "border-[#57CC99] text-[#38A3A5]"
                        }
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>

            {/* Modal chi tiết */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#38A3A5] font-bold">
                            Chi tiết đặt lịch
                        </DialogTitle>
                        <DialogDescription>
                            Xem thông tin chi tiết của lịch đã chọn
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking ? (
                        <div className="space-y-2 mt-2 text-[#2D6A4F]">
                            <p><strong>Mã đặt lịch:</strong> {selectedBooking.id}</p>
                            <p><strong>Tên người đặt:</strong> {selectedBooking.customerName}</p>
                            <p><strong>Tên xe:</strong> {selectedBooking.vehicleName}</p>
                            <p><strong>Loại pin:</strong> {selectedBooking.batteryType}</p>
                            <p><strong>Tên trạm:</strong> {selectedBooking.station}</p>
                            <p><strong>Thời gian:</strong> {selectedBooking.dateTime}</p>
                            <p>
                                <strong>Trạng thái:</strong>{" "}
                                <span
                                    className={
                                        selectedBooking.status === "Đang tiến hành"
                                            ? "text-[#2D6A4F]"
                                            : selectedBooking.status === "Đã hoàn thành"
                                                ? "text-green-600"
                                                : selectedBooking.status === "Hủy đặt lịch"
                                                    ? "text-orange-500"
                                                    : "text-red-600"
                                    }
                                >
                                    {selectedBooking.status}
                                </span>
                            </p>
                            {selectedBooking.note && (
                                <p><strong>Ghi chú:</strong> {selectedBooking.note}</p>
                            )}
                        </div>
                    ) : (
                        <p>Không có dữ liệu để hiển thị.</p>
                    )}

                    {selectedBooking?.status === "Đang tiến hành" && (
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="destructive"
                                onClick={() => handleCancelBooking(selectedBooking.id)}
                            >
                                Hủy đặt lịch
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
