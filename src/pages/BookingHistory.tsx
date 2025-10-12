import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
        window.scrollTo(0, 0); // cuộn lên đầu trang
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
    const [filterStatus, setFilterStatus] = useState<"Tất cả" | "Đang tiến hành" | "Đã kết thúc">("Đang tiến hành");
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

            if (filterFrom) {
                const fromDate = new Date(filterFrom);
                fromMatch = itemDate >= fromDate;
            }
            if (filterTo) {
                const toDate = new Date(filterTo);
                toMatch = itemDate <= toDate;
            }

            return statusMatch && fromMatch && toMatch;
        })
        .sort((a, b) => {
            return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
        });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const displayedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    const handleCancelBooking = (id: string) => {
        if (confirm(`Bạn có chắc muốn hủy đặt lịch ${id} không?`)) {
            setHistory((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: "Hủy đặt lịch", note: "Người dùng hủy đặt lịch." } : item
                )
            );
            setIsModalOpen(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Lịch sử đặt lịch</h1>

            <div className="flex justify-center gap-4 mb-4">
                <Button
                    variant={filterStatus === "Đang tiến hành" ? "default" : "outline"}
                    onClick={() => {
                        setFilterStatus("Đang tiến hành");
                        setSortStatus("Tất cả");
                        setCurrentPage(1);
                    }}
                >
                    Lịch đang tiến hành
                </Button>
                <Button
                    variant={filterStatus === "Đã kết thúc" ? "default" : "outline"}
                    onClick={() => {
                        setFilterStatus("Đã kết thúc");
                        setSortStatus("Tất cả");
                        setCurrentPage(1);
                    }}
                >
                    Lịch đã kết thúc
                </Button>
            </div>

            <div className="flex justify-center gap-2 mb-6 items-center">
                <span>from</span>
                <Input
                    type="date"
                    value={filterFrom}
                    onChange={(e) => {
                        setFilterFrom(e.target.value)
                        setCurrentPage(1);
                    }}
                    className="max-w-[150px]"
                />
                <span>to</span>
                <Input
                    type="date"
                    value={filterTo}
                    onChange={(e) => {
                        setFilterTo(e.target.value)
                        setCurrentPage(1);
                    }}
                    className="max-w-[150px]"
                />
            </div>

            {filterStatus === "Đã kết thúc" && (
                <div className="flex justify-center gap-2 mb-6">
                    {["Tất cả", "Đã hoàn thành", "Hủy đặt lịch", "Quá hạn"].map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={sortStatus === status ? "default" : "outline"}
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
            <div className="flex flex-col gap-3">
                {displayedHistory.map((item, index) => (
                    <Card
                        key={`${item.id}-${index}`}
                        className="relative p-4 shadow-sm border border-gray-200 hover:shadow-md transition w-1/3 mx-auto"
                    >
                        {/* Trạng thái ở góc phải trên */}
                        <div
                            className={`absolute top-3 right-4 font-medium ${item.status === "Đang tiến hành"
                                ? "text-blue-600"
                                : item.status === "Đã hoàn thành"
                                    ? "text-green-600"
                                    : item.status === "Hủy đặt lịch"
                                        ? "text-orange-500"
                                        : "text-red-600"
                                }`}
                        >
                            {item.status}
                        </div>

                        {/* Nội dung chính */}
                        <div>
                            <div className="font-semibold">Booking ID: {item.id}</div>
                            <div>Tên trạm: {item.station}</div>
                            <div>Thời gian đặt lịch: {item.dateTime}</div>
                        </div>

                        {/* Nút chi tiết */}
                        <div className="mt-3 flex justify-center">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setSelectedBooking(item);
                                    setIsModalOpen(true);
                                }}
                            >
                                Chi tiết
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>


            <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                        key={i + 1}
                        size="sm"
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>

            {/* === Modal xem chi tiết === */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đặt lịch</DialogTitle>
                        <DialogDescription>Xem thông tin chi tiết của lịch đã chọn</DialogDescription>
                    </DialogHeader>

                    {selectedBooking ? (
                        <div className="space-y-2 mt-2">
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
                                            ? "text-blue-600"
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
