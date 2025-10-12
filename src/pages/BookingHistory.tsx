import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BookingHistoryItem {
    id: string;
    station: string;
    dateTime: string;
    status: "Đang tiến hành" | "Đã hoàn thành" | "Hủy đặt lịch" | "Quá hạn";
}

export default function BookingHistory() {
    useEffect(() => {
        window.scrollTo(0, 0); // cuộn lên đầu trang
    }, []);

    const [history, setHistory] = useState<BookingHistoryItem[]>([
        { id: "B010", station: "Trạm 1", dateTime: "2025-10-12 14:00", status: "Đang tiến hành" },
        { id: "B011", station: "Trạm 1", dateTime: "2025-10-12 14:00", status: "Đang tiến hành" },
        { id: "B012", station: "Trạm 5", dateTime: "2025-10-13 09:00", status: "Đang tiến hành" },

        { id: "B007", station: "Trạm 2", dateTime: "2025-10-11 09:30", status: "Đã hoàn thành" },
        { id: "B006", station: "Trạm 3", dateTime: "2025-10-10 15:00", status: "Hủy đặt lịch" },
        { id: "B004", station: "Trạm 4", dateTime: "2025-10-09 10:00", status: "Quá hạn" },
        { id: "B008", station: "Trạm 2", dateTime: "2025-10-11 09:30", status: "Đã hoàn thành" },
        { id: "B005", station: "Trạm 3", dateTime: "2025-10-10 15:00", status: "Hủy đặt lịch" },
        { id: "B003", station: "Trạm 4", dateTime: "2025-10-09 10:00", status: "Quá hạn" },
        { id: "B002", station: "Trạm 6", dateTime: "2025-10-08 16:00", status: "Đã hoàn thành" },
        { id: "B001", station: "Trạm 7", dateTime: "2025-10-07 11:00", status: "Hủy đặt lịch" },
    ]);

    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [filterStatus, setFilterStatus] = useState<"Tất cả" | "Đang tiến hành" | "Đã kết thúc">("Đang tiến hành");
    const [sortStatus, setSortStatus] = useState<"Tất cả" | "Đã hoàn thành" | "Hủy đặt lịch" | "Quá hạn">("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

            <div className="flex flex-col gap-3">
                {displayedHistory.map((item, index) => (
                    <Card key={`${item.id}-${index}`} className="flex justify-between items-center p-4">
                        <div>
                            <div className="font-semibold">Booking ID: {item.id}</div>
                            <div>Tên trạm: {item.station}</div>
                            <div>Thời gian đặt lịch: {item.dateTime}</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div
                                className={`mb-2 ${item.status === "Đang tiến hành"
                                    ? "text-blue-600"
                                    : item.status === "Đã hoàn thành"
                                        ? "text-green-600"
                                        : item.status === "Hủy đặt lịch"
                                            ? "text-orange-500"
                                            : item.status === "Quá hạn"
                                                ? "text-red-600"
                                                : "text-gray-500"
                                    }`}
                            >
                                {item.status}
                            </div>
                            <Button size="sm" onClick={() => alert(`Xem chi tiết Booking ID: ${item.id}`)}>
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
        </div>
    );
}
