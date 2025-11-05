import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AvatarUploader from "./AvatarUploader";
import AddressSelector from "./AddressSelector";
import OtpVerificationDialog from "./OtpVerificationDialog";

export default function UserForm({
    form,
    setForm,
    handleChange,
    handleUsernameChange,
    validateAge,
    handleDateChange,
    usernameError,
    usernameStatus,
    ageError,
    otpVerified,
    onSendOtp,
    onVerifyOtp,
    onSubmit,
    loading,
    uploading,
    mode = "user", // "admin" | "register" | "user"
}: any) {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Khu vực Avatar + Form chính */}
            <div className="flex flex-col md:flex-row gap-8 relative">
                {/* Avatar */}
                <div className="flex flex-col items-center w-full md:w-1/3 pr-6">
                    <AvatarUploader
                        preview={form.avatarUrl}
                        onUploaded={(url: string) => setForm({ ...form, avatarUrl: url })}
                    />
                </div>

                {/* Đường phân cách (hiển thị trên màn hình lớn) */}
                <div className="hidden md:block absolute left-[33.333%] top-4 bottom-4 border-l border-emerald-200/60 transition-opacity duration-200 hover:opacity-100 opacity-70"></div>

                {/* Form nhập liệu */}
                <div className="flex-1 pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Họ và tên */}
                    <div>
                        <Label className="flex items-center gap-1 mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="fullname"
                            value={form.fullname}
                            onChange={handleChange}
                            placeholder="VD: Nguyễn Văn A"
                        />
                    </div>

                    {/* Tên đăng nhập */}
                    <div>
                        <Label className="flex items-center gap-1 mb-1">
                            Tên đăng nhập <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                name="username"
                                value={form.username}
                                onChange={handleUsernameChange}
                                disabled={!otpVerified && mode !== "register"}
                                placeholder="VD: driver001"
                            />
                            {mode !== "register" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onSendOtp}
                                    disabled={otpVerified}
                                >
                                    {otpVerified ? "✅ Đã xác thực" : "Gửi OTP"}
                                </Button>
                            )}
                        </div>

                        {/* Feedback username */}
                        {usernameError && (
                            <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                        )}
                        {!usernameError && usernameStatus === "taken" && (
                            <p className="text-sm text-red-500 mt-1">
                                Tên đăng nhập đã tồn tại.
                            </p>
                        )}
                        {!usernameError && usernameStatus === "available" && (
                            <p className="text-sm text-green-600 mt-1">
                                Tên đăng nhập khả dụng.
                            </p>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <Label className="flex items-center gap-1 mb-1">
                            Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="VD: 0912345678"
                        />
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <Label className="flex items-center gap-1 mb-1">
                            Ngày sinh <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            name="dateOfBirth"
                            value={form.dateOfBirth}
                            onChange={handleDateChange}
                        />
                        {ageError && (
                            <p className="text-sm text-red-500 mt-1">{ageError}</p>
                        )}
                    </div>

                    {/* Giới tính */}
                    <div>
                        <Label className="flex items-center gap-1 mb-1">
                            Giới tính <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-6 mt-1">
                            {["male", "female"].map((g) => (
                                <label key={g} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        checked={form.gender === g}
                                        onChange={handleChange}
                                        className="accent-emerald-500"
                                    />
                                    {g === "male" ? "Nam" : "Nữ"}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Trạng thái & Vai trò (Admin Only) */}
                    {mode === "admin" && (
                        <>
                            <div>
                                <Label className="flex items-center gap-1 mb-1">
                                    Trạng thái
                                </Label>
                                <Input
                                    value={form.status}
                                    disabled
                                    className="bg-gray-100 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1 mb-1">
                                    Vai trò
                                </Label>
                                <Input
                                    value={form.role}
                                    disabled
                                    className="bg-gray-100 text-sm"
                                />
                            </div>
                        </>
                    )}

                    {/* Địa chỉ */}
                    <div className="col-span-2 mt-3">
                        <AddressSelector form={form} setForm={setForm} />
                    </div>
                </div>
            </div>

            {/* Xác thực OTP */}
            {mode !== "register" && <OtpVerificationDialog onVerify={onVerifyOtp} />}
        </div>
    );
}
