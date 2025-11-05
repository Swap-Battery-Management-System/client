import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";
import { UserForm } from "@/components/user";

export default function AdminUpdateInfoUser({ userId, onSuccess }: { userId: string; onSuccess?: () => void }) {
    const [form, setForm] = useState({
        fullname: "",
        username: "",
        email: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        avatarUrl: "",
        status: "",
        role: "",
        country: "Việt Nam",
        city: "",
        district: "",
        ward: "",
        detailAddress: "",
    });

    const [usernameError, setUsernameError] = useState("");
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [ageError, setAgeError] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validateAge = (d: string) => {
        if (!d) return true;
        const dob = new Date(d), now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
        return age >= 18;
    };

    useEffect(() => {
        (async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/users/${userId}`);
                const u = res.data.data.user;
                setForm({
                    fullname: u.fullName || "",
                    username: u.username || "",
                    email: u.email || "",
                    phoneNumber: u.phoneNumber || "",
                    gender: u.gender === true ? "male" : u.gender === false ? "female" : "",
                    dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
                    avatarUrl: u.avatarUrl || "",
                    status: u.status || "",
                    role: u.role?.roleName || "",
                    country: "Việt Nam",
                    city: "",
                    district: "",
                    ward: "",
                    detailAddress: u.address || "",
                });
            } catch {
                toast.error("Không thể tải thông tin người dùng!");
            }
        })();
    }, [userId]);

    const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleDateChange = (e: any) => {
        handleChange(e);
        if (!validateAge(e.target.value)) setAgeError("Người dùng phải đủ 18 tuổi!");
        else setAgeError("");
    };

    const handleUsernameChange = (e: any) => {
        const value = e.target.value;
        setForm({ ...form, username: value });
        if (!/^[A-Za-z][A-Za-z0-9._]{4,19}$/.test(value)) {
            setUsernameError("Tên đăng nhập không hợp lệ!");
            setUsernameStatus("idle");
            return;
        }
        setUsernameError("");
        setUsernameStatus("checking");
        api
            .post("/auth/check", { username: value })
            .then((r) => setUsernameStatus(r.status === 204 ? "available" : "taken"))
            .catch(() => setUsernameStatus("available"));
    };

    const handleSendOtp = async () => {
        try {
            await api.post("/auth/send-otp", { email: form.email });
            toast.success("Đã gửi OTP đến email!");
        } catch {
            toast.error("Không thể gửi OTP!");
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        try {
            await api.post("/auth/verify-otp", { email: form.email, otp });
            toast.success("Xác thực OTP thành công!");
            setOtpVerified(true);
        } catch {
            toast.error("OTP không hợp lệ!");
        }
    };

    const handleSubmit = async () => {
        if (!validateAge(form.dateOfBirth)) return toast.error("Phải đủ 18 tuổi!");
        if (!form.fullname || !form.username || !form.phoneNumber) return toast.error("Thiếu thông tin!");
        setLoading(true);
        try {
            await api.patch(`/users/${userId}`, {
                fullName: form.fullname,
                username: form.username,
                phoneNumber: form.phoneNumber,
                gender: form.gender === "male",
                dateOfBirth: form.dateOfBirth,
                avatarUrl: form.avatarUrl,
                address: form.detailAddress,
            });
            toast.success("Cập nhật thành công!");
            onSuccess?.();
        } catch {
            toast.error("Không thể cập nhật!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserForm
            form={form}
            setForm={setForm}
            handleChange={handleChange}
            handleUsernameChange={handleUsernameChange}
            validateAge={validateAge}
            handleDateChange={handleDateChange}
            usernameError={usernameError}
            usernameStatus={usernameStatus}
            ageError={ageError}
            otpVerified={otpVerified}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            onSubmit={handleSubmit}
            loading={loading}
            uploading={uploading}
            mode="admin"
        />
    );
}
