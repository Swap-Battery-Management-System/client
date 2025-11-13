import { Button } from "@/components/ui/button";

export default function InvoiceDetail() {
    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between border-b pb-3 mb-4">
                <div className="font-bold text-2xl text-[#38A3A5]">🔋 SWAPNET</div>
                <div className="text-right text-sm">
                    <p className="font-semibold text-lg">HÓA ĐƠN DỊCH VỤ ĐỔI PIN</p>
                    <p>MÃ HÓA ĐƠN: INV-0001</p>
                    <p>NGÀY LẬP: __/__/2025</p>
                </div>
            </div>

            {/* ================= THÔNG TIN KHÁCH HÀNG ================= */}
            <section className="border-b pb-3 mb-3">
                <h3 className="font-semibold text-gray-700 mb-2">THÔNG TIN KHÁCH HÀNG</h3>
                <div className="text-sm space-y-1">
                    <p>- Họ tên: ____________________________</p>
                    <p>- Email: ____________________________</p>
                </div>
            </section>

            {/* ================= THÔNG TIN TRẠM ================= */}
            <section className="border-b pb-3 mb-3">
                <h3 className="font-semibold text-gray-700 mb-2">THÔNG TIN TRẠM HOẠT ĐỘNG</h3>
                <div className="text-sm space-y-1">
                    <p>- Tên trạm: ____________________________</p>
                    <p>- Địa điểm: ___________________________</p>
                </div>
            </section>

            {/* ================= CHI TIẾT DỊCH VỤ ================= */}
            <section className="border-b pb-3 mb-3">
                <h3 className="font-semibold text-gray-700 mb-2">CHI TIẾT DỊCH VỤ</h3>
                <table className="w-full text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 text-left">Mô tả</th>
                            <th className="border px-2 py-1 text-center">SL</th>
                            <th className="border px-2 py-1 text-right">Đơn giá</th>
                            <th className="border px-2 py-1 text-right">Giảm giá (₫)</th>
                            <th className="border px-2 py-1 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border px-2 py-1">Dịch vụ đổi pin</td>
                            <td className="border text-center">1</td>
                            <td className="border text-right">15.000</td>
                            <td className="border text-right text-red-500">5.000</td>
                            <td className="border text-right font-medium">10.000</td>
                        </tr>
                        <tr>
                            <td className="border px-2 py-1">Phí hư hỏng (nếu có)</td>
                            <td className="border text-center">1</td>
                            <td className="border text-right">50.000</td>
                            <td className="border text-right">0</td>
                            <td className="border text-right font-medium">50.000</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ================= CHI TIẾT PHÍ HƯ HỎNG ================= */}
            <section className="border-b pb-3 mb-3">
                <h3 className="font-semibold text-gray-700 mb-2">CHI TIẾT PHÍ HƯ HỎNG</h3>
                <table className="w-full text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1">STT</th>
                            <th className="border px-2 py-1 text-left">Loại hư hỏng</th>
                            <th className="border px-2 py-1 text-left">Tên mô tả</th>
                            <th className="border px-2 py-1">SL</th>
                            <th className="border px-2 py-1">Mức độ</th>
                            <th className="border px-2 py-1 text-right">Phí thiệt hại</th>
                            <th className="border px-2 py-1 text-right">Giảm giá (₫)</th>
                            <th className="border px-2 py-1 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border text-center">1</td>
                            <td className="border px-2">Bên trong</td>
                            <td className="border px-2">Hư hỏng đầu cáp vượt ngưỡng</td>
                            <td className="border text-center">1</td>
                            <td className="border text-center">Cao</td>
                            <td className="border text-right">10.000</td>
                            <td className="border text-right text-red-500">5.000</td>
                            <td className="border text-right font-medium">5.000</td>
                        </tr>
                        <tr>
                            <td className="border text-center">2</td>
                            <td className="border px-2">Bên ngoài</td>
                            <td className="border px-2">Hư hỏng vật lý</td>
                            <td className="border text-center">1</td>
                            <td className="border text-center">Thấp</td>
                            <td className="border text-right">20.000</td>
                            <td className="border text-right text-red-500">5.000</td>
                            <td className="border text-right font-medium">15.000</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ================= TỔNG TIỀN ================= */}
            <section className="text-sm space-y-1 text-right pr-2">
                <p>Tạm tính: <span className="font-medium">65.000</span></p>
                <p>Giảm giá do gói thuê bao (i): <span className="text-red-500">-15.000</span></p>
                <p>Phí hư hỏng: <span className="font-medium">50.000</span></p>
                <p>Giảm giá phí hư hỏng (i): <span className="text-red-500">-15.000</span></p>
                <hr className="my-2 border-gray-300" />
                <p className="text-lg font-semibold">THÀNH TIỀN: <span className="text-[#38A3A5] font-bold">85.000₫</span></p>
            </section>

            {/* ================= NÚT THANH TOÁN ================= */}
            <div className="flex justify-end mt-6">
                <Button className="bg-[#38A3A5] text-white hover:bg-[#2e8a8c] px-6 py-2 text-base">
                    💳 THANH TOÁN
                </Button>
            </div>
        </div>
    );
}
