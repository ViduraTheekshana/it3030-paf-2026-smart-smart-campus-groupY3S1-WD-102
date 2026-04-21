import React, {
	useEffect,
	useState,
	createContext,
	useContext,
	useCallback,
} from "react";
import {
	getNotifications,
	getUnreadCount,
	markAsRead as markNotificationRead,
	markAllAsRead as markAllNotificationsRead,
	deleteNotification as removeNotification,
} from "../api/notificationsApi";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
	const { user, currentUser } = useAuth();

	const fetchNotifications = async () => {
		if (!user) return;
		try {
			const data = await getNotifications();
			setNotifications(data.notifications || []);
			setUnreadCount(data.unreadCount || 0);
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
		}
	};
	// support either user or currentUser
	const authUser = user || currentUser;
	const userId = authUser?.id || authUser?.userId;

	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);

	const normalizeNotifications = (data) => {
		if (Array.isArray(data)) return data;
		if (Array.isArray(data?.notifications)) return data.notifications;
		if (Array.isArray(data?.content)) return data.content;
		return [];
	};

	const fetchUnreadCount = useCallback(async () => {
		if (!userId) {
			setUnreadCount(0);
			return;
		}

		try {
			const data = await getUnreadCount(userId);
			setUnreadCount(data.count || 0);
		} catch (error) {
			console.error("Failed to fetch unread count:", error);
		}
	}, [userId]);

	const fetchNotifications = useCallback(async () => {
		if (!userId) {
			setNotifications([]);
			setUnreadCount(0);
			return;
		}

		setLoading(true);
		try {
			const data = await getNotifications(userId);
			const list = normalizeNotifications(data);

			setNotifications(list);
			setUnreadCount(list.filter((n) => !n.read).length);
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
			setNotifications([]);
			setUnreadCount(0);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	const markAsRead = async (id) => {
		try {
			await markNotificationRead(id);

			setNotifications((prev) =>
				prev.map((n) =>
					n.id === id
						? {
								...n,
								read: true,
							}
						: n,
				),
			);

			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Failed to mark notification as read:", error);
		}
	};

	const markAllRead = async () => {
		if (!userId) return;

		try {
			await markAllNotificationsRead(userId);
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Failed to mark all notifications as read:", error);
		}
	};

	const deleteNotif = async (id) => {
		try {
			const target = notifications.find((n) => n.id === id);

			await removeNotification(id);

			setNotifications((prev) => prev.filter((n) => n.id !== id));

			if (target && !target.read) {
				setUnreadCount((prev) => Math.max(0, prev - 1));
			}
		} catch (error) {
			console.error("Failed to delete notification:", error);
		}
	};

	useEffect(() => {
		if (userId) {
			fetchUnreadCount();
			const interval = setInterval(fetchUnreadCount, 30000);
			return () => clearInterval(interval);
		} else {
			setUnreadCount(0);
		}
	}, [userId, fetchUnreadCount]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				loading,
				fetchNotifications,
				fetchUnreadCount,
				markAsRead,
				markAllRead,
				deleteNotif,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within NotificationProvider",
		);
	}
	return context;
}
