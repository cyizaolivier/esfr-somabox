import { parseJsonSafe } from "../utils/storage";

export interface SomaNotification {
    id: string;
    type: 'COURSE_COMPLETED' | 'COURSE_CREATED' | 'SYSTEM' | 'PROGRESS';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    data?: any;
}

const STORAGE_KEY = 'soma_notifications';

export const getNotifications = (): SomaNotification[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = parseJsonSafe<SomaNotification[]>(saved, []);
    return Array.isArray(parsed) ? parsed : [];
};

export const addNotification = (notif: Omit<SomaNotification, 'id' | 'timestamp' | 'read'>) => {
    const notifications = getNotifications();
    const newNotif: SomaNotification = {
        ...notif,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
    };

    // Keep only last 50 notifications
    const updated = [newNotif, ...notifications].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
    return newNotif;
};

export const markAsRead = (id: string) => {
    const notifications = getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
};

export const markAllAsRead = () => {
    const notifications = getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
};

export const clearNotifications = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('storage'));
};
