// ====================== 🧩 IMPORT THƯ VIỆN ======================
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

// ====================== 🧾 KHAI BÁO KIỂU DỮ LIỆU ======================
interface Invoice {
    type: string;
    userId: string;
    subUserId: string;
    bookingId: string;
    amountOrigin: number;
    amountDiscount: number;
    amountTotal: number;
    reason: string;
    status: string;
}

// ====================== 🧾 COMPONENT CHÍNH ======================
const CreateInvoice = () => {
    // 🎯 State lưu thông tin hóa đơn
    const [invoice, setInvoice] = useState<Invoice>({
        type: "booking",
        userId: "",
        subUserId: "",
        bookingId: "",
        amountOrigin: 0,
        amountDiscount: 0,
        amountTotal: 0,
        reason: "battery swap service",
        status: "pending",
    });

    // 🧮 Hàm xử lý cập nhật form & tính tổng tiền
    const handleChange = (field: keyof Invoice, value: string | number) => {
        const updated = { ...invoice, [field]: value };
        updated.amountTotal =
            Number(updated.amountOrigin || 0) - Number(updated.amountDiscount || 0);
        setInvoice(updated);
    };

    // 🧾 Nút "Tạo hóa đơn" (Mock)
    const handleSubmit = () => {
        alert("💾 Hóa đơn (mock):\n" + JSON.stringify(invoice, null, 2));
    };

    // ====================== 🎨 GIAO DIỆN TRANG ======================
    return (
        <Container className="py-4">
            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <h4 className="text-center fw-bold text-success mb-4">
                        🧾 TẠO HÓA ĐƠN TRẠM ĐỔI PIN
                    </h4>

                    {/* ----------- FORM NHẬP LIỆU ----------- */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Loại hóa đơn</Form.Label>
                                <Form.Select
                                    value={invoice.type}
                                    onChange={(e) => handleChange("type", e.target.value)}
                                >
                                    <option value="booking">Booking</option>
                                    <option value="manual">Manual</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mã người dùng (userId)</Form.Label>
                                <Form.Control
                                    placeholder="user-001"
                                    value={invoice.userId}
                                    onChange={(e) => handleChange("userId", e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mã phụ (subUserId)</Form.Label>
                                <Form.Control
                                    placeholder="sub-001"
                                    value={invoice.subUserId}
                                    onChange={(e) =>
                                        handleChange("subUserId", e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mã Booking</Form.Label>
                                <Form.Control
                                    placeholder="booking-001"
                                    value={invoice.bookingId}
                                    onChange={(e) =>
                                        handleChange("bookingId", e.target.value)
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select
                                    value={invoice.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Lý do / Dịch vụ</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="battery swap service"
                                    value={invoice.reason}
                                    onChange={(e) =>
                                        handleChange("reason", e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* ----------- PHẦN TIỀN TỆ ----------- */}
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Thành tiền gốc (VNĐ)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={invoice.amountOrigin}
                                    onChange={(e) =>
                                        handleChange(
                                            "amountOrigin",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Giảm giá (VNĐ)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={invoice.amountDiscount}
                                    onChange={(e) =>
                                        handleChange(
                                            "amountDiscount",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tổng thanh toán (VNĐ)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={invoice.amountTotal}
                                    readOnly
                                    className="fw-bold bg-light"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* ----------- NÚT HÀNH ĐỘNG ----------- */}
                    <div className="text-center mt-3">
                        <Button
                            variant="success"
                            className="px-4 py-2 fw-semibold"
                            onClick={handleSubmit}
                        >
                            💾 Tạo hóa đơn (Mock)
                        </Button>
                    </div>

                    <p className="text-center text-muted mt-4 small">
                        *Trang này hiện chỉ là giao diện hiển thị, chưa gắn API. <br />
                        Sau khi backend hoàn thiện, có thể tích hợp POST /invoices.
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
};

// ====================== ✅ EXPORT COMPONENT ======================
export default CreateInvoice;
