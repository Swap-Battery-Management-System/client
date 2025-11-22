import AdminNotifications from "./AdminNotifications";
import AdminSupportTickets from "./AdminSupportTickets";

export default function AdminSupport() {
    return (
        <div className="p-6">
            <AdminNotifications />
            <AdminSupportTickets />
        </div>
    );
}
