import { create } from "zustand";

interface NotificationItem {
    notification_id: string;
    message: string;
    type: string;
    created_date: string;
    status: "Read" | "Unread";
}

interface NotificationState {
    unreadCount: number;
    latestNotifications: NotificationItem[];

    setUnreadCount: (count: number) => void;
    decreaseUnread: () => void;
    increaseUnread: () => void;
    resetUnread: () => void;

    setLatestNotifications: (list: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => void;
    updateOneAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,

    // ⭐ Header hiển thị 5 thông báo mới nhất
    latestNotifications: [],

    // ───── unread count ─────
    setUnreadCount: (count) => set({ unreadCount: count }),
    decreaseUnread: () =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
    increaseUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
    resetUnread: () => set({ unreadCount: 0 }),

    // ───── Cập nhật 5 thông báo mới nhất (Header) ─────
    setLatestNotifications: (list) =>
        set(() => ({
            latestNotifications: Array.isArray(list) ? list : list([]),
        })),


    // ───── Cập nhật 1 thông báo đã đọc trong Header dropdown ─────
    updateOneAsRead: (id: string) =>
        set((state) => ({
            latestNotifications: state.latestNotifications.map((n) =>
                n.notification_id === id ? { ...n, status: "Read" } : n
            ),
        })),
}));
