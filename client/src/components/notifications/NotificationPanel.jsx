import React, { useEffect, useRef, useState } from "react";
import {
	FiBell,
	FiCheck,
	FiTrash2,
	FiX,
	FiCheckCircle,
	FiAlertCircle,
	FiInfo,
	FiGift,
	FiBookOpen,
	FiCalendar,
	FiZap,
} from "react-icons/fi";
import { useNotifications } from "../../context/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const typeIcons = {
	BOOKING_APPROVED: CheckCircleIcon,
	BOOKING_REJECTED: CheckCircleIcon,
	BOOKING_CANCELLED: CheckCircleIcon,
	TICKET_STATUS_CHANGED: AlertCircleIcon,
	NEW_COMMENT: MessageSquareIcon,
	SYSTEM_ALERT: BellIcon,
};
function timeAgo(dateStr) {
	const diff = Date.now() - new Date(dateStr).getTime();
	const m = Math.floor(diff / 60000);

	if (m < 1) return "Just now";
	if (m < 60) return `${m}m ago`;

	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;

	return `${Math.floor(h / 24)}d ago`;
}

function NotifIcon({ type }) {
	const s = {
		width: 32,
		height: 32,
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	};

	switch (type) {
		case "WELCOME":
			return (
				<div style={{ ...s, background: "#eff6ff" }}>
					<FiGift size={15} color="#3b82f6" />
				</div>
			);
		case "BOOKING":
		case "BOOKING_UPDATE":
			return (
				<div style={{ ...s, background: "#f0fdf4" }}>
					<FiCalendar size={15} color="#16a34a" />
				</div>
			);
		case "TICKET":
		case "TICKET_UPDATE":
			return (
				<div style={{ ...s, background: "#fdf4ff" }}>
					<FiAlertCircle size={15} color="#9333ea" />
				</div>
			);
		case "RESOURCE":
			return (
				<div style={{ ...s, background: "#fff7ed" }}>
					<FiBookOpen size={15} color="#ea580c" />
				</div>
			);
		case "PROFILE":
			return (
				<div style={{ ...s, background: "#f0fdf4" }}>
					<FiCheckCircle size={15} color="#16a34a" />
				</div>
			);
		case "SYSTEM":
			return (
				<div style={{ ...s, background: "#fef3c7" }}>
					<FiZap size={15} color="#d97706" />
				</div>
			);
		default:
			return (
				<div style={{ ...s, background: "#f1f5f9" }}>
					<FiInfo size={15} color="#64748b" />
				</div>
			);
	}
}

export function NotificationPanel() {
	const {
		notifications,
		unreadCount,
		loading,
		fetchNotifications,
		markAsRead,
		markAllRead,
		deleteNotif,
	} = useNotifications();

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

	const handleToggle = async () => {
		const next = !isOpen;
		setIsOpen(next);

		if (next) {
			await fetchNotifications();
		}
	};

	const handleNotificationClick = async (notification) => {
		if (!notification.read) {
			await markAsRead(notification.id);
		}
	};

	return (
		<div style={{ position: "relative" }} ref={panelRef}>
			<button
				style={styles.bellBtn}
				onClick={handleToggle}
				title="Notifications"
			>
				<FiBell size={18} color="#94a3b8" />
				{unreadCount > 0 && (
					<span style={styles.badge}>
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.18 }}
						style={styles.notifPanel}
					>
						{/* Header */}
						<div style={styles.notifHeader}>
							<div>
								<span style={styles.notifTitle}>Notifications</span>
								{unreadCount > 0 && (
									<span style={styles.unreadBadge}>{unreadCount} new</span>
								)}
							</div>

							<div style={{ display: "flex", gap: 4 }}>
								{unreadCount > 0 && (
									<button
										style={styles.headerBtn}
										onClick={markAllRead}
										title="Mark all read"
									>
										<FiCheck size={13} /> All read
									</button>
								)}

								<button
									style={{ ...styles.headerBtn, padding: "4px 6px" }}
									onClick={() => setIsOpen(false)}
								>
									<FiX size={13} />
								</button>
							</div>
						</div>

						{/* List */}
						<div style={styles.notifList}>
							{loading ? (
								<div style={styles.notifEmpty}>Loading...</div>
							) : notifications.length === 0 ? (
								<div style={styles.notifEmpty}>
									<FiBell size={28} color="#cbd5e1" />
									<p style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
										No notifications yet
									</p>
								</div>
							) : (
								notifications.map((notification) => (
									<div
										key={notification.id}
										style={{
											...styles.notifItem,
											background: notification.read ? "#fff" : "#f0f7ff",
										}}
										onClick={() => handleNotificationClick(notification)}
									>
										<NotifIcon type={notification.type} />

										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
												}}
											>
												<p
													style={{
														...styles.notifItemTitle,
														fontWeight: notification.read ? 500 : 700,
													}}
												>
													{notification.title}
												</p>
												{!notification.read && (
													<span style={styles.unreadDot} />
												)}
											</div>

											<p style={styles.notifItemMsg}>{notification.message}</p>
											<p style={styles.notifItemTime}>
												{timeAgo(notification.createdAt)}
											</p>
										</div>

										<button
											style={styles.deleteBtn}
											onClick={(e) => {
												e.stopPropagation();
												deleteNotif(notification.id);
											}}
											title="Delete"
										>
											<FiTrash2 size={12} color="#cbd5e1" />
										</button>
									</div>
								))
							)}
						</div>

						{/* Footer */}
						{notifications.length > 0 && (
							<div style={styles.notifFooter}>
								<Link
									to="/notifications"
									style={styles.viewAllBtn}
									onClick={() => setIsOpen(false)}
								>
									View all notifications
								</Link>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

const styles = {
	bellBtn: {
		width: 36,
		height: 36,
		borderRadius: "50%",
		background: "#1e293b",
		border: "1px solid #334155",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
	},
	badge: {
		position: "absolute",
		top: -3,
		right: -3,
		background: "#ef4444",
		color: "#fff",
		fontSize: 9,
		fontWeight: 700,
		padding: "1px 4px",
		borderRadius: 8,
		border: "2px solid #0f172a",
		minWidth: 16,
		textAlign: "center",
	},
	notifPanel: {
		position: "absolute",
		top: 46,
		right: 0,
		width: 360,
		maxHeight: 520,
		background: "#fff",
		border: "1px solid #e8edf2",
		borderRadius: 16,
		boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
		overflow: "hidden",
		zIndex: 300,
		display: "flex",
		flexDirection: "column",
	},
	notifHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "14px 16px",
		borderBottom: "1px solid #f1f5f9",
	},
	notifTitle: {
		fontSize: 14,
		fontWeight: 700,
		color: "#0f172a",
	},
	unreadBadge: {
		marginLeft: 8,
		fontSize: 10,
		fontWeight: 700,
		background: "#3b82f6",
		color: "#fff",
		padding: "2px 7px",
		borderRadius: 20,
	},
	headerBtn: {
		display: "flex",
		alignItems: "center",
		gap: 4,
		padding: "4px 10px",
		borderRadius: 7,
		border: "1px solid #e2e8f0",
		background: "#fff",
		fontSize: 11,
		fontWeight: 600,
		color: "#64748b",
		cursor: "pointer",
	},
	notifList: {
		flex: 1,
		overflowY: "auto",
		maxHeight: 380,
	},
	notifEmpty: {
		padding: "2.5rem",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	notifItem: {
		display: "flex",
		alignItems: "flex-start",
		gap: 10,
		padding: "12px 16px",
		cursor: "pointer",
		borderBottom: "1px solid #f8fafc",
		transition: "background 0.1s",
	},
	notifItemTitle: {
		fontSize: 13,
		color: "#0f172a",
		marginBottom: 2,
		lineHeight: 1.3,
	},
	notifItemMsg: {
		fontSize: 12,
		color: "#64748b",
		lineHeight: 1.4,
		marginBottom: 3,
	},
	notifItemTime: {
		fontSize: 10,
		color: "#94a3b8",
	},
	unreadDot: {
		width: 7,
		height: 7,
		borderRadius: "50%",
		background: "#3b82f6",
		flexShrink: 0,
		marginTop: 3,
	},
	deleteBtn: {
		background: "none",
		border: "none",
		cursor: "pointer",
		padding: 4,
		flexShrink: 0,
		opacity: 0.5,
		display: "flex",
		alignItems: "center",
	},
	notifFooter: {
		borderTop: "1px solid #f1f5f9",
		padding: "10px 16px",
	},
	viewAllBtn: {
		display: "block",
		textAlign: "center",
		fontSize: 13,
		color: "#3b82f6",
		textDecoration: "none",
		fontWeight: 500,
	},
};
