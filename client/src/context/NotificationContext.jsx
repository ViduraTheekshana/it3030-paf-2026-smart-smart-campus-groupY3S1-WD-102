import React, { useEffect, useState, createContext, useContext } from "react";
import {
	getNotifications,
	markAsRead as markNotificationRead,
} from "../services/notifications";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
	const { user } = useAuth();
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const fetchNotifications = async () => {
		if (!user) return;
		try {
			const data = await getNotifications();
			setNotifications(data);
			setUnreadCount(data.filter((n) => !n.read).length);
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
		}
	};

	const markAsRead = async (id) => {
		try {
			await markNotificationRead(id);
		} catch (error) {
			// TODO: Handle error (e.g. show toast)
		}
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
	};

	useEffect(() => {
		if (user) {
			fetchNotifications();
			const interval = setInterval(fetchNotifications, 30000);
			return () => clearInterval(interval);
		}
	}, [user]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				fetchNotifications,
				markAsRead,
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
