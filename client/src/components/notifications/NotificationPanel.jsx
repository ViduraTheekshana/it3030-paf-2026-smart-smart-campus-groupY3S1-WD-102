import React, { useEffect, useState, useRef } from "react";
import {
	BellIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	MessageSquareIcon,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

const typeIcons = {
	BOOKING_APPROVED: CheckCircleIcon,
	BOOKING_REJECTED: CheckCircleIcon,
	BOOKING_CANCELLED: CheckCircleIcon,
	TICKET_STATUS_CHANGED: AlertCircleIcon,
	NEW_COMMENT: MessageSquareIcon,
	SYSTEM_ALERT: BellIcon,
};

export function NotificationPanel() {
	const { notifications, unreadCount, markAsRead } = useNotifications();
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (panelRef.current && !panelRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleNotificationClick = (notification) => {
		if (!notification.read) {
			markAsRead(notification.id);
		}
	};

	return (
		<div className="relative" ref={panelRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
			>
				<BellIcon className="h-6 w-6" />
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{
							opacity: 0,
							y: -10,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							y: -10,
						}}
						className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
					>
						<div className="p-4 border-b border-gray-200">
							<h3 className="text-sm font-semibold text-gray-900">
								Notifications
							</h3>
						</div>
						<div className="max-h-96 overflow-y-auto">
							{notifications.length === 0 ? (
								<div className="p-8 text-center text-sm text-gray-500">
									No notifications
								</div>
							) : (
								<div className="divide-y divide-gray-100">
									{notifications.map((notification) => {
										const Icon = typeIcons[notification.type] || BellIcon;
										return (
											<div
												key={notification.id}
												onClick={() => handleNotificationClick(notification)}
												className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-blue-50" : ""}`}
											>
												<div className="flex gap-3">
													<Icon className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900">
															{notification.title}
														</p>
														<p className="text-sm text-gray-600 mt-1">
															{notification.message}
														</p>
														<p className="text-xs text-gray-500 mt-1">
															{new Date(
																notification.createdAt,
															).toLocaleString()}
														</p>
													</div>
													{!notification.read && (
														<div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
