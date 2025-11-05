import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function OtpVerificationDialog({ onVerify }: any) {
    const [open, setOpen] = useState(false);
    const [otp, setOtp] = useState("");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-[#38A3A5] text-xl font-semibold">
                        Xác thực OTP
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600 text-center mb-4">
                    Nhập <b>6 chữ số</b> được gửi đến email của bạn.
                </p>

                <div className="flex justify-center gap-2 mb-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={otp[i] || ""}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                const newOtp = otp.substring(0, i) + value + otp.substring(i + 1);
                                setOtp(newOtp);
                            }}
                            className="w-10 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-md focus:border-[#57CC99]"
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button
                        onClick={() => onVerify(otp)}
                        disabled={otp.length !== 6}
                        className="bg-[#57CC99] hover:bg-[#38A3A5] text-white"
                    >
                        Xác nhận
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
