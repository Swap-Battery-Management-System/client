"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Send } from "lucide-react";
import { toast } from "sonner";

interface User {
    fullName: string;
    avatarUrl?: string;
}

interface Station {
    id: string;
    name: string;
}

interface Feedback {
    id: string;
    comment: string;
    rating: number;
    createdAt: string;
    reply?: string;
    user?: User;
    station?: Station;
}

export default function ManagerFeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
    const [currentStation, setCurrentStation] = useState<Station | null>(null);

    // Fetch station hiện tại
    const fetchCurrentStation = async () => {
        try {
            const res = await api.get("/stations", { withCredentials: true });
            console.log("Fetch stations response:", res.data); // debug
            // lấy trạm hiện tại
            const station = res.data?.data?.stations;
            console.log("Current station:", station); // debug
            setCurrentStation(station);
            return station?.id;
        } catch (err: any) {
            console.error("Fetch station error:", err);
            toast.error(`Không lấy được trạm hiện tại! Status: ${err.response?.status}`);
            return null;
        }
    };


    // Fetch feedbacks của station
    const fetchFeedbacks = async (stationId: string | null) => {
        if (!stationId) return;
        try {
            setLoading(true);
            const res = await api.get("/feedbacks", {
                params: { page: 1, limit: 50 },
                withCredentials: true,
            });
            console.log("Fetch feedbacks response:", res.data); // debug

            const stationFeedbacks = (res.data?.data?.feedbacks || []).filter(
                (fb: Feedback) => fb.station?.id === stationId
            );
            console.log("Filtered feedbacks:", stationFeedbacks); // debug
            setFeedbacks(stationFeedbacks);
        } catch (err: any) {
            console.error("Fetch feedbacks error:", err);
            toast.error(`Không thể tải feedback! Status: ${err.response?.status}`);
        } finally {
            setLoading(false);
        }
    };

    // Reply feedback
    const replyFeedback = async (id: string) => {
        const text = replyInputs[id]?.trim();
        console.log("Replying to feedback:", id, "with text:", text); // debug
        if (!text) return toast.error("Vui lòng nhập nội dung trả lời");

        try {
            const res = await api.post(
                `/feedbacks/${id}/reply`,
                { reply: text },
                { withCredentials: true }
            );
            console.log("Reply response:", res.data); // debug
            toast.success("Trả lời thành công!");
            setReplyInputs((prev) => ({ ...prev, [id]: "" }));
            if (currentStation) fetchFeedbacks(currentStation.id);
        } catch (err: any) {
            console.error("Reply feedback error:", err);
            toast.error(`Không thể gửi phản hồi! Status: ${err.response?.status}`);
        }
    };

    // Fetch data khi component mount
    useEffect(() => {
        console.log("ManagerFeedbackManagement mounted");
        const fetchData = async () => {
            const stationId = await fetchCurrentStation();
            console.log("Station ID for feedback fetch:", stationId);
            await fetchFeedbacks(stationId);
        };
        fetchData();
    }, []);

    // Debug feedbacks khi update
    useEffect(() => {
        console.log("Feedbacks updated:", feedbacks);
    }, [feedbacks]);

    const averageRating =
        feedbacks.length > 0
            ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length
            : 0;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare size={26} />
                Quản lý Feedback khách hàng
            </h1>

            {loading ? (
                <p>Đang tải feedback...</p>
            ) : (
                <div className="space-y-4">
                    {/* Rating trung bình */}
                    <Card className="p-4 shadow-md border">
                        <h2 className="font-semibold text-lg mb-2">
                            Rating trung bình của trạm: {currentStation?.name || "..."}
                        </h2>
                        <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: Math.round(averageRating) }).map((_, i) => (
                                <Star key={i} size={20} fill="gold" />
                            ))}
                            <span className="ml-2 text-gray-700">{averageRating.toFixed(1)} / 5</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Dựa trên {feedbacks.length} phản hồi
                        </p>
                    </Card>

                    {/* Danh sách feedback */}
                    {feedbacks.map((fb) => (
                        <Card key={fb.id} className="p-4 shadow-sm border">
                            <div className="flex gap-3">
                                <img
                                    src={fb.user?.avatarUrl || "https://i.pravatar.cc/100"}
                                    alt=""
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{fb.user?.fullName}</h3>
                                        <span className="text-xs text-gray-500">
                                            {new Date(fb.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-gray-700">{fb.comment}</p>

                                    <div className="flex mt-2 text-yellow-500">
                                        {Array.from({ length: fb.rating }).map((_, i) => (
                                            <Star key={i} size={18} fill="gold" />
                                        ))}
                                    </div>
                                    <p className="text-sm mt-1 text-gray-500">
                                        Trạm: {fb.station?.name}
                                    </p>

                                    {/* Reply */}
                                    {fb.reply ? (
                                        <div className="mt-3 bg-green-50 p-3 rounded-md border text-green-700">
                                            <strong>Phản hồi:</strong> {fb.reply}
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <textarea
                                                rows={3}
                                                className="w-full border rounded p-2"
                                                placeholder="Nhập phản hồi..."
                                                value={replyInputs[fb.id] || ""}
                                                onChange={(e) =>
                                                    setReplyInputs((prev) => ({
                                                        ...prev,
                                                        [fb.id]: e.target.value,
                                                    }))
                                                }
                                            />
                                            <Button
                                                className="mt-2 flex gap-2"
                                                onClick={() => replyFeedback(fb.id)}
                                            >
                                                <Send size={16} /> Gửi phản hồi
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
