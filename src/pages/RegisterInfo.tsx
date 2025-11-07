import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/stores/authStores";
import { UserForm } from "@/components/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterInfo() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const pendingEmail = location.state?.email || localStorage.getItem("pendingEmail");
    const savedUserId = localStorage.getItem("pendingUserId");
    const userId = user?.id || savedUserId;

    const [form, setForm] = useState({
        fullname: "",
        username: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        country: "Việt Nam",
        city: "",
        district: "",
        ward: "",
        detailAddress: "",
        avatarUrl: "",
    });

    const [usernameError, setUsernameError] = useState("");
    const [usernameStatus, setUsernameStatus] = useState<
        "idle" | "checking" | "available" | "taken"
    >("idle");
    const [ageError, setAgeError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateAge = (dateStr: string) => {
        if (!dateStr) return true;
        const dob = new Date(dateStr);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
        return age >= 18;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        setAgeError(validateAge(e.target.value) ? "" : "Phải đủ 18 tuổi!");
    };

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setForm((prev) => ({ ...prev, username: value }));

        if (!/^[A-Za-z][A-Za-z0-9._]{4,19}$/.test(value)) {
            setUsernameError("Tên đăng nhập không hợp lệ!");
            setUsernameStatus("idle");
            return;
        }

        setUsernameError("");
        setUsernameStatus("checking");

        try {
            const res = await api.post("/auth/check", { username: value });
            setUsernameStatus(res.status === 204 ? "available" : "taken");
        } catch {
            setUsernameStatus("available");
        }
    };

    const handleSubmit = async () => {
        if (!form.fullname || !form.username || !form.phoneNumber || !form.gender || !form.dateOfBirth)
            return toast.error("Vui lòng nhập đủ thông tin!");

        if (!validateAge(form.dateOfBirth))
            return toast.error("Phải đủ 18 tuổi!");

        if (!userId) {
            toast.error("Không tìm thấy thông tin người dùng!");
            return;
        }

        setLoading(true);

        try {
            const address = [form.detailAddress, form.ward, form.district, form.city, form.country]
                .filter(Boolean)
                .join(", ");

            await api.patch(`/users/${userId}/complete`, {
                fullName: form.fullname,
                username: form.username,
                phoneNumber: form.phoneNumber,
                gender: form.gender === "male",
                dateOfBirth: form.dateOfBirth,
                avatarUrl: form.avatarUrl,
                address,
            });

            toast.success("Hoàn tất đăng ký thành công! 🎉");

            const pendingPassword = localStorage.getItem("pendingPassword");
            const token = useAuthStore.getState().accessToken;

            if (pendingEmail && pendingPassword) {
                // Đăng ký bằng email
                const res = await api.post("/auth/login", {
                    email: pendingEmail,
                    password: pendingPassword,
                });
                useAuthStore.getState().setAccessToken(res.data.data.accessToken);
                setUser(res.data.data.user);
            } else if (token) {
                // Đăng ký bằng Google
                const res = await api.get("/auth/me");
                setUser(res.data.data);
            } else {
                toast.warning("Không tìm thấy token hoặc thông tin đăng nhập!");
                navigate("/login");
                return;
            }

            localStorage.removeItem("pendingEmail");
            localStorage.removeItem("pendingPassword");
            localStorage.removeItem("pendingUserId");
            navigate("/home");
        } catch (err: any) {
            console.error("❌ Lỗi khi hoàn tất đăng ký:", err);
            toast.error(err.response?.data?.message || "Không thể hoàn tất đăng ký!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#F9FAFB] py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl"
            >
                <Card className="p-8 shadow-lg rounded-2xl border border-gray-200 bg-white">
                    <div className="flex flex-col items-center mb-6">
                        <div className="text-3xl font-semibold text-[#38A3A5]">Hoàn tất đăng ký</div>
                        <p className="text-gray-500 text-sm mt-1">
                            Điền thông tin cá nhân để bắt đầu sử dụng SwapNet
                        </p>
                    </div>

                    <div className="border-t pt-6">
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
                            otpVerified={true}
                            onSubmit={handleSubmit}
                            loading={loading}
                            uploading={false}
                            mode="register"
                        />
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-1/2 py-3 text-lg rounded-xl bg-[#57CC99] hover:bg-[#38A3A5] text-white font-semibold transition-all duration-200"
                        >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
