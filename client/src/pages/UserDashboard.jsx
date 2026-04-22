import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
	FiUsers,
	FiBarChart2,
	FiHome,
	FiLogOut,
	FiBell,
	FiSearch,
	FiEdit2,
	FiLock,
	FiUnlock,
	FiTrash2,
	FiX,
	FiCheck,
	FiSend,
	FiAlertTriangle,
	FiGift,
	FiCalendar,
	FiAlertCircle,
	FiBookOpen,
	FiZap,
	FiInfo,
	FiCheckCircle,
	FiUserCheck,
	FiUserX,
	FiUserPlus,
} from "react-icons/fi";
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const ROLE_COLORS = {
	ROLE_USER: {
		label: "Student",
		bg: "#eff6ff",
		color: "#1d4ed8",
		dot: "#3b82f6",
	},
	ROLE_TECHNICIAN: {
		label: "Technician",
		bg: "#f0fdf4",
		color: "#15803d",
		dot: "#22c55e",
	},
	ROLE_MANAGER: {
		label: "Manager",
		bg: "#fdf4ff",
		color: "#7e22ce",
		dot: "#a855f7",
	},
	ROLE_ADMIN: {
		label: "Administrator",
		bg: "#fef3c7",
		color: "#92400e",
		dot: "#f59e0b",
	},
};

function RoleBadge({ role }) {
	const cfg = ROLE_COLORS[role] || ROLE_COLORS.ROLE_USER;
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				padding: "3px 10px",
				borderRadius: 20,
				fontSize: 12,
				fontWeight: 600,
				background: cfg.bg,
				color: cfg.color,
			}}
		>
			<span
				style={{
					width: 6,
					height: 6,
					borderRadius: "50%",
					background: cfg.dot,
					display: "inline-block",
				}}
			/>
			{cfg.label}
		</span>
	);
}

function StatusBadge({ enabled }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				padding: "3px 10px",
				borderRadius: 20,
				fontSize: 12,
				fontWeight: 600,
				background: enabled ? "#f0fdf4" : "#fef2f2",
				color: enabled ? "#15803d" : "#dc2626",
			}}
		>
			<span
				style={{
					width: 6,
					height: 6,
					borderRadius: "50%",
					background: enabled ? "#22c55e" : "#ef4444",
					display: "inline-block",
				}}
			/>
			{enabled ? "Active" : "Disabled"}
		</span>
	);
}

function Avatar({ user, size = 36 }) {
	const displayName = user.fullName || user.name || "?";
	const ini = displayName
		.trim()
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const colors = [
		"#3b82f6",
		"#8b5cf6",
		"#ec4899",
		"#f59e0b",
		"#10b981",
		"#ef4444",
	];
	const color = colors[((user.email || "").charCodeAt(0) || 0) % colors.length];

	return user.profilePictureUrl ? (
		<img
			src={user.profilePictureUrl}
			alt={displayName}
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				objectFit: "cover",
			}}
		/>
	) : (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				background: color,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: size * 0.35,
				fontWeight: 700,
				color: "#fff",
			}}
		>
			{ini}
		</div>
	);
}

function NotifIcon({ type }) {
	const s = {
		width: 28,
		height: 28,
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
					<FiGift size={13} color="#3b82f6" />
				</div>
			);
		case "BOOKING":
			return (
				<div style={{ ...s, background: "#f0fdf4" }}>
					<FiCalendar size={13} color="#16a34a" />
				</div>
			);
		case "TICKET":
			return (
				<div style={{ ...s, background: "#fdf4ff" }}>
					<FiAlertCircle size={13} color="#9333ea" />
				</div>
			);
		case "RESOURCE":
			return (
				<div style={{ ...s, background: "#fff7ed" }}>
					<FiBookOpen size={13} color="#ea580c" />
				</div>
			);
		case "SYSTEM":
			return (
				<div style={{ ...s, background: "#fef3c7" }}>
					<FiZap size={13} color="#d97706" />
				</div>
			);
		default:
			return (
				<div style={{ ...s, background: "#f1f5f9" }}>
					<FiInfo size={13} color="#64748b" />
				</div>
			);
	}
}

function timeAgo(dateStr) {
	if (!dateStr) return "—";
	const diff = Date.now() - new Date(dateStr).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1) return "Just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];

const EMPTY_NEW_USER = {
	fullName: "",
	email: "",
	password: "",
};

export default function UserDashboard() {
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();

	const [users, setUsers] = useState([]);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");
	const [editUser, setEditUser] = useState(null);
	const [editForm, setEditForm] = useState({});
	const [saving, setSaving] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [toast, setToast] = useState(null);
	const [activeTab, setActiveTab] = useState("users");

	const [notifOpen, setNotifOpen] = useState(false);
	const [notifs, setNotifs] = useState([]);
	const [unread, setUnread] = useState(0);
	const [notifLoad, setNotifLoad] = useState(false);
	const notifRef = useRef(null);

	const [sendPanel, setSendPanel] = useState(false);
	const [sendForm, setSendForm] = useState({
		userId: "",
		type: "BOOKING",
		title: "",
		message: "",
	});
	const [sendLoading, setSendLoading] = useState(false);
	const [broadcastMode, setBroadcastMode] = useState(false);

	const [addAdminOpen, setAddAdminOpen] = useState(false);
	const [addTechOpen, setAddTechOpen] = useState(false);
	const [newUserForm, setNewUserForm] = useState(EMPTY_NEW_USER);
	const [newUserErrors, setNewUserErrors] = useState({});
	const [newUserLoading, setNewUserLoading] = useState(false);
	const [newUserServerErr, setNewUserServerErr] = useState("");
	const [newUserPwVisible, setNewUserPwVisible] = useState(false);

	const adminId = currentUser?.userId || currentUser?.id;

	useEffect(() => {
		if (currentUser && currentUser.role !== "ROLE_ADMIN") {
			navigate("/dashboard");
			return;
		}
		fetchUsers();
		fetchStats();
		fetchAdminUnread();
		const iv = setInterval(fetchAdminUnread, 30000);
		return () => clearInterval(iv);
	}, []);

	useEffect(() => {
		const handler = (e) => {
			if (notifRef.current && !notifRef.current.contains(e.target)) {
				setNotifOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	async function fetchUsers() {
		setLoading(true);
		try {
			const { data } = await api.get("/admin/users");
			setUsers(data);
		} catch (err) {
			if (err.response?.status === 401 || err.response?.status === 403) {
				logout();
				navigate("/login");
			} else {
				showToast("Failed to load users", "error");
			}
		} finally {
			setLoading(false);
		}
	}

	async function fetchStats() {
		setStatsLoading(true);
		try {
			// Stats endpoint doesn't exist yet, calculate from users data
			const { data: users } = await api.get("/admin/users");
			const stats = {
				total: users.length,
				students: users.filter((u) => u.role === "ROLE_USER").length,
				technicians: users.filter((u) => u.role === "ROLE_TECHNICIAN").length,
				managers: users.filter((u) => u.role === "ROLE_MANAGER").length,
				admins: users.filter((u) => u.role === "ROLE_ADMIN").length,
			};
			setStats(stats || {});
		} catch (err) {
			console.error("Stats error:", err);
			setStats({});
		} finally {
			setStatsLoading(false);
		}
	}
	async function fetchAdminUnread() {
		if (!adminId) return;
		try {
			const { data } = await api.get(
				`/api/notifications/user/${adminId}/unread-count`,
			);
			setUnread(data.count || 0);
		} catch {}
	}

	async function openNotifPanel() {
		setNotifOpen((o) => !o);
		if (notifOpen || !adminId) return;

		setNotifLoad(true);
		try {
			const { data } = await api.get(`/api/notifications/user/${adminId}`);
			setNotifs(data);
			setUnread(data.filter((n) => !n.read).length);
		} catch {
		} finally {
			setNotifLoad(false);
		}
	}

	async function markNotifRead(id) {
		try {
			await api.put(`/api/notifications/${id}/read`, {});
			setNotifs((prev) =>
				prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
			);
			setUnread((p) => Math.max(0, p - 1));
		} catch {}
	}

	async function markAllNotifRead() {
		if (!adminId) return;
		try {
			await api.put(`/api/notifications/user/${adminId}/read-all`, {});
			setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnread(0);
		} catch {}
	}

	function showToast(msg, type = "success") {
		setToast({ msg, type });
		setTimeout(() => setToast(null), 3000);
	}

	function openEdit(user) {
		setEditUser(user);
		setEditForm({
			fullName: user.fullName || "",
			email: user.email || "",
			role: user.role || "ROLE_USER",
			enabled: user.enabled,
		});
	}

	async function saveEdit() {
		const targetId = editUser?.userId || editUser?.id;
		if (!targetId) return;

		setSaving(true);
		try {
			await api.put(`/api/users/${targetId}`, editForm);
			setUsers((prev) =>
				prev.map((u) =>
					(u.userId || u.id) === targetId ? { ...u, ...editForm } : u,
				),
			);
			setEditUser(null);
			fetchStats();
			showToast("User updated");
		} catch {
			showToast("Failed to update user", "error");
		} finally {
			setSaving(false);
		}
	}

	async function toggleStatus(user) {
		const targetId = user.userId || user.id;
		if (!targetId) return;

		try {
			await api.put(`/api/users/${targetId}`, { enabled: !user.enabled });
			setUsers((prev) =>
				prev.map((u) =>
					(u.userId || u.id) === targetId ? { ...u, enabled: !u.enabled } : u,
				),
			);
			fetchStats();
			showToast(`User ${!user.enabled ? "enabled" : "disabled"}`);
		} catch {
			showToast("Failed to update status", "error");
		}
	}

	async function confirmDelete() {
		const targetId = deleteTarget?.userId || deleteTarget?.id;
		if (!targetId) return;

		try {
			await api.delete(`/api/users/${targetId}`);
			setUsers((prev) => prev.filter((u) => (u.userId || u.id) !== targetId));
			setDeleteTarget(null);
			fetchStats();
			showToast("User deleted");
		} catch {
			showToast("Failed to delete user", "error");
		}
	}

	async function handleSendNotification() {
		if (!sendForm.title.trim() || !sendForm.message.trim()) {
			return showToast("Title and message are required", "error");
		}
		if (!broadcastMode && !sendForm.userId.trim()) {
			return showToast("User ID is required", "error");
		}

		setSendLoading(true);
		try {
			if (broadcastMode) {
				await api.post("/api/notifications/broadcast", {
					title: sendForm.title,
					message: sendForm.message,
				});
				showToast("Broadcast sent to all users");
			} else {
				await api.post("/api/notifications", {
					userId: sendForm.userId.trim(),
					type: sendForm.type,
					title: sendForm.title,
					message: sendForm.message,
					relatedId: "",
				});
				showToast("Notification sent");
			}
			setSendForm({ userId: "", type: "BOOKING", title: "", message: "" });
			setSendPanel(false);
		} catch {
			showToast("Failed to send notification", "error");
		} finally {
			setSendLoading(false);
		}
	}

	function openAddModal(role) {
		setNewUserForm(EMPTY_NEW_USER);
		setNewUserErrors({});
		setNewUserServerErr("");
		setNewUserPwVisible(false);

		if (role === "ROLE_ADMIN") setAddAdminOpen(true);
		else setAddTechOpen(true);
	}

	function closeAddModals() {
		setAddAdminOpen(false);
		setAddTechOpen(false);
	}

	function validateNewUser() {
		const e = {};
		if (!newUserForm.fullName.trim()) e.fullName = "Full name is required.";
		if (
			!newUserForm.email.trim() ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)
		) {
			e.email = "A valid email is required.";
		}
		if (!newUserForm.password || newUserForm.password.length < 8) {
			e.password = "Password must be at least 8 characters.";
		}
		return e;
	}

	async function handleAddUser(role) {
		setNewUserServerErr("");
		const errs = validateNewUser();
		setNewUserErrors(errs);
		if (Object.keys(errs).length) return;

		setNewUserLoading(true);
		try {
			const { data } = await api.post("/api/users/create", {
				fullName: newUserForm.fullName.trim(),
				email: newUserForm.email.trim().toLowerCase(),
				password: newUserForm.password,
				role,
			});
			setUsers((prev) => [...prev, data]);
			fetchStats();
			closeAddModals();
			showToast(
				`${role === "ROLE_ADMIN" ? "Admin" : "Technician"} account created`,
			);
		} catch (err) {
			setNewUserServerErr(
				err.response?.data?.message ||
					"Failed to create account. Please try again.",
			);
		} finally {
			setNewUserLoading(false);
		}
	}

	const filtered = users.filter((u) => {
		const q = search.toLowerCase();
		const fullName = (u.fullName || "").toLowerCase();
		const email = (u.email || "").toLowerCase();

		const matchSearch = !q || fullName.includes(q) || email.includes(q);
		const matchRole = roleFilter === "ALL" || u.role === roleFilter;
		return matchSearch && matchRole;
	});

	const localStats = {
		total: users.length,
		students: users.filter((u) => u.role === "ROLE_USER").length,
		technicians: users.filter((u) => u.role === "ROLE_TECHNICIAN").length,
		managers: users.filter((u) => u.role === "ROLE_MANAGER").length,
		admins: users.filter((u) => u.role === "ROLE_ADMIN").length,
		active: users.filter((u) => u.enabled).length,
	};

	const roleChartData = [
		{ name: "Students", value: stats?.students ?? localStats.students },
		{
			name: "Technicians",
			value: stats?.technicians ?? localStats.technicians,
		},
		{ name: "Managers", value: stats?.managers ?? localStats.managers },
		{ name: "Admins", value: stats?.admins ?? localStats.admins },
	].filter((d) => d.value > 0);

	const statusChartData = [
		{ name: "Active", value: stats?.active ?? localStats.active },
		{
			name: "Disabled",
			value: stats?.disabled ?? localStats.total - localStats.active,
		},
	];

	const providerChartData = [
		{ name: "Local", value: stats?.localUsers ?? 0 },
		{ name: "Google", value: stats?.googleUsers ?? 0 },
		{ name: "Facebook", value: stats?.facebookUsers ?? 0 },
	].filter((d) => d.value > 0);

	const monthlyData = stats?.registrationsByMonth
		? Object.entries(stats.registrationsByMonth).map(([month, count]) => ({
				month,
				count,
			}))
		: [];

	function AddUserModal({ role, open, onClose }) {
		if (!open) return null;

		const isAdmin = role === "ROLE_ADMIN";
		const accentColor = isAdmin ? "#92400e" : "#15803d";
		const accentBg = isAdmin ? "#fef3c7" : "#dcfce7";
		const label = isAdmin ? "Administrator" : "Technician";

		return (
			<div style={S.overlay} onClick={onClose}>
				<div
					style={{ ...S.modal, maxWidth: 460 }}
					onClick={(e) => e.stopPropagation()}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1.25rem",
						}}
					>
						<h2 style={S.modalTitle}>
							<span
								style={{
									background: accentBg,
									color: accentColor,
									padding: "4px 10px",
									borderRadius: 8,
									fontSize: 13,
									fontWeight: 700,
									marginRight: 10,
								}}
							>
								{label}
							</span>
							Add New {label}
						</h2>
						<button
							onClick={onClose}
							style={{ background: "none", border: "none", cursor: "pointer" }}
						>
							<FiX size={18} color="#94a3b8" />
						</button>
					</div>

					{newUserServerErr && (
						<div
							style={{
								background: "#fef2f2",
								border: "1.5px solid #fecaca",
								borderRadius: 8,
								padding: "9px 12px",
								fontSize: 13,
								color: "#dc2626",
								marginBottom: "1rem",
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							<FiAlertTriangle size={14} /> {newUserServerErr}
						</div>
					)}

					<div
						style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
					>
						<div>
							<label style={S.modalLabel}>Full Name</label>
							<input
								style={{
									...S.modalInput,
									...(newUserErrors.fullName ? { borderColor: "#f87171" } : {}),
								}}
								placeholder="Jane Doe"
								value={newUserForm.fullName}
								onChange={(e) => {
									setNewUserForm((p) => ({ ...p, fullName: e.target.value }));
									setNewUserErrors((p) => ({ ...p, fullName: null }));
								}}
							/>
							{newUserErrors.fullName && (
								<p style={{ fontSize: 12, color: "#dc2626", marginTop: 3 }}>
									{newUserErrors.fullName}
								</p>
							)}
						</div>

						<div>
							<label style={S.modalLabel}>Email Address</label>
							<input
								style={{
									...S.modalInput,
									...(newUserErrors.email ? { borderColor: "#f87171" } : {}),
								}}
								type="email"
								placeholder="jane@example.com"
								value={newUserForm.email}
								onChange={(e) => {
									setNewUserForm((p) => ({ ...p, email: e.target.value }));
									setNewUserErrors((p) => ({ ...p, email: null }));
								}}
							/>
							{newUserErrors.email && (
								<p style={{ fontSize: 12, color: "#dc2626", marginTop: 3 }}>
									{newUserErrors.email}
								</p>
							)}
						</div>

						<div>
							<label style={S.modalLabel}>Password</label>
							<div style={{ position: "relative" }}>
								<input
									type={newUserPwVisible ? "text" : "password"}
									style={{
										...S.modalInput,
										paddingRight: 38,
										...(newUserErrors.password
											? { borderColor: "#f87171" }
											: {}),
									}}
									placeholder="Min. 8 characters"
									value={newUserForm.password}
									onChange={(e) => {
										setNewUserForm((p) => ({ ...p, password: e.target.value }));
										setNewUserErrors((p) => ({ ...p, password: null }));
									}}
								/>
								<button
									type="button"
									onClick={() => setNewUserPwVisible((v) => !v)}
									style={{
										position: "absolute",
										right: 10,
										top: "50%",
										transform: "translateY(-50%)",
										background: "none",
										border: "none",
										cursor: "pointer",
										padding: 2,
										display: "flex",
										alignItems: "center",
									}}
								>
									<FiCheckCircle
										size={14}
										color={newUserPwVisible ? "#3b82f6" : "#94a3b8"}
									/>
								</button>
							</div>
							{newUserErrors.password && (
								<p style={{ fontSize: 12, color: "#dc2626", marginTop: 3 }}>
									{newUserErrors.password}
								</p>
							)}
						</div>
					</div>

					<div
						style={{
							display: "flex",
							gap: 10,
							marginTop: "1.5rem",
							justifyContent: "flex-end",
						}}
					>
						<button onClick={onClose} style={S.modalCancelBtn}>
							Cancel
						</button>
						<button
							onClick={() => handleAddUser(role)}
							disabled={newUserLoading}
							style={{
								...S.modalSaveBtn,
								background: isAdmin ? "#92400e" : "#15803d",
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							<FiUserPlus size={13} />
							{newUserLoading ? "Creating…" : `Create ${label}`}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div style={S.page}>
			<main style={S.main}>
				<header style={S.header}>
					<div>
						<h1 style={S.pageTitle}>
							{activeTab === "users" ? "User Management" : "Platform Overview"}
						</h1>
						<p style={S.pageSubtitle}>
							{activeTab === "users"
								? `${filtered.length} of ${users.length} users`
								: `${localStats.total} total users · ${localStats.active} active`}
						</p>
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<button
							onClick={() => openAddModal("ROLE_ADMIN")}
							style={{ ...S.actionHeaderBtn, background: "#92400e" }}
						>
							<FiUserPlus size={14} /> Add Admin
						</button>

						<button
							onClick={() => openAddModal("ROLE_TECHNICIAN")}
							style={{ ...S.actionHeaderBtn, background: "#15803d" }}
						>
							<FiUserPlus size={14} /> Add Technician
						</button>

						<button
							onClick={() => setSendPanel(true)}
							style={S.actionHeaderBtn}
						>
							<FiSend size={14} /> Send Notification
						</button>

						<div style={{ position: "relative" }} ref={notifRef}>
							<button
								style={S.bellBtn}
								onClick={openNotifPanel}
								title="My Notifications"
							>
								<FiBell size={16} color="#64748b" />
								{unread > 0 && (
									<span style={S.badge}>{unread > 99 ? "99+" : unread}</span>
								)}
							</button>

							{notifOpen && (
								<div style={{ ...S.notifPanel, right: 0 }}>
									<div style={S.notifHeader}>
										<span
											style={{
												fontSize: 13,
												fontWeight: 700,
												color: "#0f172a",
											}}
										>
											My Notifications
										</span>
										<div style={{ display: "flex", gap: 4 }}>
											{unread > 0 && (
												<button style={S.smBtn} onClick={markAllNotifRead}>
													<FiCheck size={11} /> All read
												</button>
											)}
											<button
												style={{ ...S.smBtn, padding: "3px 6px" }}
												onClick={() => setNotifOpen(false)}
											>
												<FiX size={11} />
											</button>
										</div>
									</div>

									<div style={{ maxHeight: 340, overflowY: "auto" }}>
										{notifLoad ? (
											<div
												style={{
													padding: "2rem",
													textAlign: "center",
													color: "#94a3b8",
													fontSize: 13,
												}}
											>
												Loading...
											</div>
										) : notifs.length === 0 ? (
											<div
												style={{
													padding: "2rem",
													textAlign: "center",
													color: "#94a3b8",
													fontSize: 13,
												}}
											>
												No notifications
											</div>
										) : (
											notifs.map((n) => (
												<div
													key={n.id}
													style={{
														display: "flex",
														gap: 8,
														padding: "10px 14px",
														cursor: "pointer",
														background: n.read ? "#fff" : "#f0f7ff",
														borderBottom: "1px solid #f8fafc",
													}}
													onClick={() => !n.read && markNotifRead(n.id)}
												>
													<NotifIcon type={n.type} />
													<div style={{ flex: 1 }}>
														<p
															style={{
																fontSize: 12,
																fontWeight: n.read ? 500 : 700,
																color: "#0f172a",
																marginBottom: 2,
															}}
														>
															{n.title}
														</p>
														<p
															style={{
																fontSize: 11,
																color: "#64748b",
																marginBottom: 2,
															}}
														>
															{n.message}
														</p>
														<p style={{ fontSize: 10, color: "#94a3b8" }}>
															{timeAgo(n.createdAt)}
														</p>
													</div>
													{!n.read && (
														<span
															style={{
																width: 7,
																height: 7,
																borderRadius: "50%",
																background: "#3b82f6",
																flexShrink: 0,
																marginTop: 4,
															}}
														/>
													)}
												</div>
											))
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</header>

				<div style={S.statsGrid}>
					{[
						{
							label: "Total Users",
							value: localStats.total,
							icon: <FiUsers size={16} />,
							color: "#3b82f6",
							bg: "#eff6ff",
						},
						{
							label: "Students",
							value: localStats.students,
							icon: "🎓",
							color: "#1d4ed8",
							bg: "#dbeafe",
						},
						{
							label: "Technicians",
							value: localStats.technicians,
							icon: "🔧",
							color: "#15803d",
							bg: "#dcfce7",
						},
						{
							label: "Managers",
							value: localStats.managers,
							icon: "📋",
							color: "#7e22ce",
							bg: "#faf5ff",
						},
						{
							label: "Admins",
							value: localStats.admins,
							icon: <FiZap size={16} />,
							color: "#92400e",
							bg: "#fef3c7",
						},
						{
							label: "Active",
							value: localStats.active,
							icon: <FiUserCheck size={16} />,
							color: "#059669",
							bg: "#d1fae5",
						},
						{
							label: "Disabled",
							value: localStats.total - localStats.active,
							icon: <FiUserX size={16} />,
							color: "#dc2626",
							bg: "#fee2e2",
						},
					].map((s) => (
						<div key={s.label} style={S.statCard}>
							<div style={{ ...S.statIcon, background: s.bg, color: s.color }}>
								{s.icon}
							</div>
							<div style={S.statVal}>{s.value}</div>
							<div style={S.statLabel}>{s.label}</div>
						</div>
					))}
				</div>

				{activeTab === "users" && (
					<>
						<div style={S.filterBar}>
							<div style={S.searchWrap}>
								<FiSearch
									size={14}
									color="#94a3b8"
									style={{
										position: "absolute",
										left: 11,
										top: "50%",
										transform: "translateY(-50%)",
									}}
								/>
								<input
									style={S.searchInput}
									placeholder="Search by name or email…"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>

							<div style={S.roleFilters}>
								{[
									"ALL",
									"ROLE_USER",
									"ROLE_TECHNICIAN",
									"ROLE_MANAGER",
									"ROLE_ADMIN",
								].map((r) => (
									<button
										key={r}
										onClick={() => setRoleFilter(r)}
										style={{
											...S.filterChip,
											...(roleFilter === r ? S.filterChipActive : {}),
										}}
									>
										{r === "ALL" ? "All Roles" : ROLE_COLORS[r]?.label || r}
									</button>
								))}
							</div>
						</div>

						<div style={S.tableWrap}>
							{loading ? (
								<div style={S.emptyState}>Loading users…</div>
							) : filtered.length === 0 ? (
								<div style={S.emptyState}>No users found</div>
							) : (
								<table style={S.table}>
									<thead>
										<tr>
											{[
												"User",
												"Email",
												"Role",
												"Provider",
												"Status",
												"Joined",
												"Actions",
											].map((h) => (
												<th key={h} style={S.th}>
													{h}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{filtered.map((user, i) => {
											const userKey = user.userId || user.id;
											return (
												<tr
													key={userKey}
													style={{
														...S.tr,
														background: i % 2 === 0 ? "#fff" : "#f8fafc",
													}}
												>
													<td style={S.td}>
														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: 10,
															}}
														>
															<Avatar user={user} size={34} />
															<div>
																<div
																	style={{
																		fontWeight: 600,
																		fontSize: 13,
																		color: "#0f172a",
																	}}
																>
																	{user.fullName || "—"}
																</div>
																<div style={{ fontSize: 11, color: "#94a3b8" }}>
																	{user.userId || "—"}
																</div>
															</div>
														</div>
													</td>
													<td style={S.td}>
														<span style={{ fontSize: 13, color: "#475569" }}>
															{user.email}
														</span>
													</td>
													<td style={S.td}>
														<RoleBadge role={user.role} />
													</td>
													<td style={S.td}>
														<span
															style={{
																fontSize: 12,
																color: "#64748b",
																fontWeight: 500,
															}}
														>
															{user.provider || "LOCAL"}
														</span>
													</td>
													<td style={S.td}>
														<StatusBadge enabled={user.enabled} />
													</td>
													<td style={S.td}>
														<span style={{ fontSize: 12, color: "#94a3b8" }}>
															{user.createdAt
																? new Date(user.createdAt).toLocaleDateString(
																		"en-GB",
																		{
																			day: "2-digit",
																			month: "short",
																			year: "numeric",
																		},
																	)
																: "—"}
														</span>
													</td>
													<td style={S.td}>
														<div style={{ display: "flex", gap: 5 }}>
															<button
																onClick={() => openEdit(user)}
																style={S.actionBtn}
																title="Edit"
															>
																<FiEdit2 size={13} />
															</button>

															<button
																onClick={() => toggleStatus(user)}
																style={S.actionBtn}
																title={user.enabled ? "Disable" : "Enable"}
															>
																{user.enabled ? (
																	<FiLock size={13} color="#f59e0b" />
																) : (
																	<FiUnlock size={13} color="#22c55e" />
																)}
															</button>

															<button
																onClick={() => {
																	setSendForm((f) => ({
																		...f,
																		userId: userKey,
																	}));
																	setSendPanel(true);
																	setBroadcastMode(false);
																}}
																style={S.actionBtn}
																title="Send notification"
															>
																<FiBell size={13} color="#3b82f6" />
															</button>

															{userKey !== adminId && (
																<button
																	onClick={() => setDeleteTarget(user)}
																	style={{ ...S.actionBtn, color: "#ef4444" }}
																	title="Delete"
																>
																	<FiTrash2 size={13} />
																</button>
															)}
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							)}
						</div>
					</>
				)}

				{activeTab === "overview" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
						{statsLoading ? (
							<div
								style={{
									padding: "3rem",
									textAlign: "center",
									color: "#94a3b8",
									fontSize: 14,
								}}
							>
								Loading analytics…
							</div>
						) : (
							<>
								<div style={S.chartRow}>
									<div style={S.chartCard}>
										<h3 style={S.chartTitle}>Users by Role</h3>
										<ResponsiveContainer width="100%" height={220}>
											<BarChart
												data={roleChartData}
												margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
											>
												<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
												<XAxis
													dataKey="name"
													tick={{ fontSize: 12, fill: "#64748b" }}
												/>
												<YAxis
													tick={{ fontSize: 12, fill: "#64748b" }}
													allowDecimals={false}
												/>
												<Tooltip
													contentStyle={{
														fontSize: 12,
														borderRadius: 8,
														border: "1px solid #e2e8f0",
													}}
												/>
												<Bar dataKey="value" name="Users" radius={[6, 6, 0, 0]}>
													{roleChartData.map((_, idx) => (
														<Cell
															key={idx}
															fill={PIE_COLORS[idx % PIE_COLORS.length]}
														/>
													))}
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									</div>

									<div style={S.chartCard}>
										<h3 style={S.chartTitle}>Account Status</h3>
										<ResponsiveContainer width="100%" height={220}>
											<PieChart>
												<Pie
													data={statusChartData}
													cx="50%"
													cy="50%"
													outerRadius={80}
													dataKey="value"
													nameKey="name"
													label={({ name, percent }) =>
														`${name} ${(percent * 100).toFixed(0)}%`
													}
													labelLine={false}
												>
													<Cell fill="#22c55e" />
													<Cell fill="#ef4444" />
												</Pie>
												<Tooltip
													contentStyle={{
														fontSize: 12,
														borderRadius: 8,
														border: "1px solid #e2e8f0",
													}}
												/>
												<Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
											</PieChart>
										</ResponsiveContainer>
									</div>

									<div style={S.chartCard}>
										<h3 style={S.chartTitle}>Login Provider</h3>
										<ResponsiveContainer width="100%" height={220}>
											<PieChart>
												<Pie
													data={providerChartData}
													cx="50%"
													cy="50%"
													innerRadius={50}
													outerRadius={80}
													dataKey="value"
													nameKey="name"
												>
													{providerChartData.map((_, idx) => (
														<Cell
															key={idx}
															fill={PIE_COLORS[idx % PIE_COLORS.length]}
														/>
													))}
												</Pie>
												<Tooltip
													contentStyle={{
														fontSize: 12,
														borderRadius: 8,
														border: "1px solid #e2e8f0",
													}}
												/>
												<Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
											</PieChart>
										</ResponsiveContainer>
									</div>
								</div>

								{monthlyData.length > 0 && (
									<div style={{ ...S.chartCard, width: "100%" }}>
										<h3 style={S.chartTitle}>Registrations Over Time</h3>
										<ResponsiveContainer width="100%" height={220}>
											<LineChart
												data={monthlyData}
												margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
											>
												<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
												<XAxis
													dataKey="month"
													tick={{ fontSize: 12, fill: "#64748b" }}
												/>
												<YAxis
													tick={{ fontSize: 12, fill: "#64748b" }}
													allowDecimals={false}
												/>
												<Tooltip
													contentStyle={{
														fontSize: 12,
														borderRadius: 8,
														border: "1px solid #e2e8f0",
													}}
												/>
												<Line
													type="monotone"
													dataKey="count"
													name="New Users"
													stroke="#3b82f6"
													strokeWidth={2}
													dot={{ r: 4, fill: "#3b82f6" }}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								)}

								<div style={S.chartCard}>
									<h3 style={S.chartTitle}>Recently Joined Users</h3>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: 10,
											marginTop: 10,
										}}
									>
										{[...users]
											.sort(
												(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
											)
											.slice(0, 5)
											.map((user) => (
												<div
													key={user.userId || user.id}
													style={{
														display: "flex",
														alignItems: "center",
														gap: 10,
														padding: "8px 0",
														borderBottom: "1px solid #f1f5f9",
													}}
												>
													<Avatar user={user} size={32} />
													<div style={{ flex: 1 }}>
														<div
															style={{
																fontSize: 13,
																fontWeight: 600,
																color: "#0f172a",
															}}
														>
															{user.fullName || "—"}
														</div>
														<div style={{ fontSize: 11, color: "#94a3b8" }}>
															{user.email}
														</div>
													</div>
													<RoleBadge role={user.role} />
													<span
														style={{
															fontSize: 11,
															color: "#94a3b8",
															minWidth: 70,
															textAlign: "right",
														}}
													>
														{user.createdAt ? timeAgo(user.createdAt) : "—"}
													</span>
												</div>
											))}
									</div>
								</div>
							</>
						)}
					</div>
				)}
			</main>

			<AddUserModal
				role="ROLE_ADMIN"
				open={addAdminOpen}
				onClose={closeAddModals}
			/>
			<AddUserModal
				role="ROLE_TECHNICIAN"
				open={addTechOpen}
				onClose={closeAddModals}
			/>

			{sendPanel && (
				<div style={S.overlay} onClick={() => setSendPanel(false)}>
					<div
						style={{ ...S.modal, maxWidth: 480 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "1.25rem",
							}}
						>
							<h2 style={S.modalTitle}>
								<FiSend
									size={18}
									style={{ marginRight: 8, color: "#3b82f6" }}
								/>
								Send Notification
							</h2>
							<button
								onClick={() => setSendPanel(false)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
								}}
							>
								<FiX size={18} color="#94a3b8" />
							</button>
						</div>

						<div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
							<button
								onClick={() => setBroadcastMode(false)}
								style={{
									...S.toggleBtn,
									...(!broadcastMode ? S.toggleBtnActive : {}),
								}}
							>
								Single User
							</button>
							<button
								onClick={() => setBroadcastMode(true)}
								style={{
									...S.toggleBtn,
									...(broadcastMode ? S.toggleBtnActive : {}),
								}}
							>
								Broadcast to All
							</button>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "0.85rem",
							}}
						>
							{!broadcastMode && (
								<div>
									<label style={S.modalLabel}>User ID</label>
									<input
										style={S.modalInput}
										placeholder="Paste user ID here"
										value={sendForm.userId}
										onChange={(e) =>
											setSendForm((f) => ({ ...f, userId: e.target.value }))
										}
									/>
								</div>
							)}

							<div>
								<label style={S.modalLabel}>Type</label>
								<select
									style={S.modalInput}
									value={sendForm.type}
									onChange={(e) =>
										setSendForm((f) => ({ ...f, type: e.target.value }))
									}
								>
									{[
										"BOOKING",
										"TICKET",
										"RESOURCE",
										"PROFILE",
										"SYSTEM",
										"WELCOME",
									].map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>

							<div>
								<label style={S.modalLabel}>Title</label>
								<input
									style={S.modalInput}
									placeholder="Notification title"
									value={sendForm.title}
									onChange={(e) =>
										setSendForm((f) => ({ ...f, title: e.target.value }))
									}
								/>
							</div>

							<div>
								<label style={S.modalLabel}>Message</label>
								<textarea
									style={{ ...S.modalInput, height: 90, resize: "vertical" }}
									placeholder="Notification message..."
									value={sendForm.message}
									onChange={(e) =>
										setSendForm((f) => ({ ...f, message: e.target.value }))
									}
								/>
							</div>
						</div>

						<div
							style={{
								display: "flex",
								gap: 10,
								marginTop: "1.5rem",
								justifyContent: "flex-end",
							}}
						>
							<button
								onClick={() => setSendPanel(false)}
								style={S.modalCancelBtn}
							>
								Cancel
							</button>
							<button
								onClick={handleSendNotification}
								disabled={sendLoading}
								style={{
									...S.modalSaveBtn,
									display: "flex",
									alignItems: "center",
									gap: 6,
								}}
							>
								<FiSend size={13} />
								{sendLoading
									? "Sending..."
									: broadcastMode
										? "Broadcast"
										: "Send"}
							</button>
						</div>
					</div>
				</div>
			)}

			{editUser && (
				<div style={S.overlay} onClick={() => setEditUser(null)}>
					<div style={S.modal} onClick={(e) => e.stopPropagation()}>
						<h2 style={S.modalTitle}>Edit User</h2>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "1rem",
								marginTop: "1.25rem",
							}}
						>
							<div>
								<label style={S.modalLabel}>Full Name</label>
								<input
									style={S.modalInput}
									value={editForm.fullName || ""}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, fullName: e.target.value }))
									}
								/>
							</div>

							<div>
								<label style={S.modalLabel}>Email</label>
								<input
									style={S.modalInput}
									value={editForm.email || ""}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, email: e.target.value }))
									}
								/>
							</div>

							<div>
								<label style={S.modalLabel}>Role</label>
								<select
									style={S.modalInput}
									value={editForm.role || "ROLE_USER"}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, role: e.target.value }))
									}
								>
									{[
										"ROLE_USER",
										"ROLE_TECHNICIAN",
										"ROLE_MANAGER",
										"ROLE_ADMIN",
									].map((r) => (
										<option key={r} value={r}>
											{ROLE_COLORS[r]?.label || r}
										</option>
									))}
								</select>
							</div>
						</div>

						<div
							style={{
								display: "flex",
								gap: 10,
								marginTop: "1.5rem",
								justifyContent: "flex-end",
							}}
						>
							<button
								onClick={() => setEditUser(null)}
								style={S.modalCancelBtn}
							>
								Cancel
							</button>
							<button
								onClick={saveEdit}
								disabled={saving}
								style={S.modalSaveBtn}
							>
								{saving ? "Saving…" : "Save changes"}
							</button>
						</div>
					</div>
				</div>
			)}

			{deleteTarget && (
				<div style={S.overlay} onClick={() => setDeleteTarget(null)}>
					<div
						style={{ ...S.modal, maxWidth: 380 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								marginBottom: 12,
							}}
						>
							<div
								style={{
									width: 48,
									height: 48,
									borderRadius: "50%",
									background: "#fef2f2",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<FiAlertTriangle size={22} color="#ef4444" />
							</div>
						</div>

						<h2 style={{ ...S.modalTitle, textAlign: "center", fontSize: 18 }}>
							Delete User?
						</h2>
						<p
							style={{
								fontSize: 14,
								color: "#64748b",
								margin: "8px 0 20px",
								textAlign: "center",
							}}
						>
							This will permanently delete{" "}
							<strong>{deleteTarget.fullName || deleteTarget.email}</strong>.
						</p>

						<div
							style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
						>
							<button
								onClick={() => setDeleteTarget(null)}
								style={S.modalCancelBtn}
							>
								Cancel
							</button>
							<button
								onClick={confirmDelete}
								style={{ ...S.modalSaveBtn, background: "#ef4444" }}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{toast && (
				<div
					style={{
						...S.toast,
						background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
						borderColor: toast.type === "error" ? "#fecaca" : "#bbf7d0",
						color: toast.type === "error" ? "#dc2626" : "#15803d",
					}}
				>
					{toast.type === "error" ? <FiX size={14} /> : <FiCheck size={14} />}
					{toast.msg}
				</div>
			)}
		</div>
	);
}

/* keep your existing S object below unchanged */
const S = {
	page: {
		display: "flex",
		minHeight: "100vh",
		background: "#f1f5f9",
		fontFamily: "'DM Sans','Segoe UI',sans-serif",
	},
	sidebar: {
		width: 220,
		background: "#0f172a",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		padding: "1.5rem 1rem",
		position: "sticky",
		top: 0,
		height: "100vh",
		flexShrink: 0,
	},
	sidebarTop: { flex: 1 },
	sideLogoRow: { display: "flex", alignItems: "center", gap: 10 },
	sideLogo: {
		width: 36,
		height: 36,
		borderRadius: 9,
		background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 13,
		fontWeight: 700,
		color: "#fff",
	},
	sideLogoText: { fontSize: 14, fontWeight: 700, color: "#f1f5f9" },
	navItem: {
		display: "flex",
		alignItems: "center",
		gap: 10,
		width: "100%",
		padding: "9px 12px",
		borderRadius: 8,
		border: "none",
		background: "transparent",
		color: "#94a3b8",
		fontSize: 14,
		fontWeight: 500,
		cursor: "pointer",
		textAlign: "left",
		fontFamily: "inherit",
		marginBottom: 2,
	},
	navItemActive: { background: "#1e293b", color: "#f1f5f9" },
	sideAdminCard: {
		display: "flex",
		alignItems: "center",
		gap: 10,
		padding: "10px 12px",
		background: "#1e293b",
		borderRadius: 10,
	},
	main: { flex: 1, padding: "2rem", overflow: "auto" },
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: "1.75rem",
	},
	pageTitle: {
		fontSize: 24,
		fontWeight: 700,
		color: "#0f172a",
		letterSpacing: "-0.5px",
	},
	pageSubtitle: { fontSize: 14, color: "#64748b", marginTop: 3 },
	actionHeaderBtn: {
		display: "flex",
		alignItems: "center",
		gap: 6,
		padding: "8px 14px",
		borderRadius: 8,
		border: "none",
		background: "#3b82f6",
		color: "#fff",
		fontSize: 13,
		fontWeight: 600,
		cursor: "pointer",
	},
	bellBtn: {
		width: 36,
		height: 36,
		borderRadius: "50%",
		background: "#fff",
		border: "1px solid #e2e8f0",
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
		border: "2px solid #f1f5f9",
		minWidth: 16,
		textAlign: "center",
	},
	notifPanel: {
		position: "absolute",
		top: 44,
		width: 320,
		background: "#fff",
		border: "1px solid #e8edf2",
		borderRadius: 14,
		boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
		overflow: "hidden",
		zIndex: 400,
	},
	notifHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "12px 14px",
		borderBottom: "1px solid #f1f5f9",
	},
	smBtn: {
		display: "flex",
		alignItems: "center",
		gap: 3,
		padding: "3px 8px",
		borderRadius: 6,
		border: "1px solid #e2e8f0",
		background: "#fff",
		fontSize: 11,
		color: "#64748b",
		cursor: "pointer",
	},
	statsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))",
		gap: 12,
		marginBottom: "1.75rem",
	},
	statCard: {
		background: "#fff",
		borderRadius: 14,
		padding: "1rem 1.25rem",
		boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
		display: "flex",
		flexDirection: "column",
		gap: 4,
		border: "1px solid #e8edf2",
	},
	statIcon: {
		width: 34,
		height: 34,
		borderRadius: 8,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 16,
		marginBottom: 4,
	},
	statVal: {
		fontSize: 26,
		fontWeight: 700,
		color: "#0f172a",
		letterSpacing: "-1px",
	},
	statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
	filterBar: {
		display: "flex",
		gap: 12,
		marginBottom: "1.25rem",
		flexWrap: "wrap",
		alignItems: "center",
	},
	searchWrap: { position: "relative", flex: "1 1 240px", minWidth: 200 },
	searchInput: {
		width: "100%",
		padding: "9px 12px 9px 34px",
		borderRadius: 10,
		border: "1.5px solid #e2e8f0",
		fontSize: 14,
		color: "#0f172a",
		outline: "none",
		fontFamily: "inherit",
		background: "#fff",
		boxSizing: "border-box",
	},
	roleFilters: { display: "flex", gap: 6, flexWrap: "wrap" },
	filterChip: {
		padding: "5px 12px",
		borderRadius: 20,
		border: "1.5px solid #e2e8f0",
		background: "#fff",
		fontSize: 12,
		fontWeight: 600,
		cursor: "pointer",
		color: "#64748b",
		fontFamily: "inherit",
	},
	filterChipActive: {
		background: "#1e293b",
		color: "#fff",
		border: "1.5px solid #1e293b",
	},
	tableWrap: {
		background: "#fff",
		borderRadius: 14,
		border: "1px solid #e8edf2",
		overflow: "hidden",
		boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
	},
	table: { width: "100%", borderCollapse: "collapse" },
	th: {
		padding: "12px 16px",
		textAlign: "left",
		fontSize: 11,
		fontWeight: 700,
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: "0.06em",
		borderBottom: "1.5px solid #f1f5f9",
		background: "#f8fafc",
	},
	tr: { transition: "background 0.1s" },
	td: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9" },
	actionBtn: {
		padding: "5px 7px",
		borderRadius: 7,
		border: "1px solid #e2e8f0",
		background: "#fff",
		cursor: "pointer",
		fontSize: 14,
		lineHeight: 1,
		display: "inline-flex",
		alignItems: "center",
	},
	emptyState: {
		padding: "3rem",
		textAlign: "center",
		color: "#94a3b8",
		fontSize: 14,
	},
	overlay: {
		position: "fixed",
		inset: 0,
		background: "rgba(0,0,0,0.4)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 500,
		padding: "1rem",
	},
	modal: {
		background: "#fff",
		borderRadius: 16,
		padding: "2rem",
		width: "100%",
		maxWidth: 440,
		boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 700,
		color: "#0f172a",
		display: "flex",
		alignItems: "center",
	},
	modalLabel: {
		display: "block",
		fontSize: 12,
		fontWeight: 600,
		color: "#64748b",
		marginBottom: 5,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	modalInput: {
		width: "100%",
		padding: "9px 12px",
		borderRadius: 8,
		border: "1.5px solid #e2e8f0",
		fontSize: 14,
		color: "#0f172a",
		outline: "none",
		fontFamily: "inherit",
		boxSizing: "border-box",
	},
	modalCancelBtn: {
		padding: "8px 18px",
		borderRadius: 8,
		border: "1.5px solid #e2e8f0",
		background: "#fff",
		color: "#374151",
		fontSize: 14,
		fontWeight: 500,
		cursor: "pointer",
		fontFamily: "inherit",
	},
	modalSaveBtn: {
		padding: "8px 18px",
		borderRadius: 8,
		border: "none",
		background: "#1e293b",
		color: "#fff",
		fontSize: 14,
		fontWeight: 600,
		cursor: "pointer",
		fontFamily: "inherit",
	},
	toggleBtn: {
		padding: "6px 14px",
		borderRadius: 8,
		border: "1.5px solid #e2e8f0",
		background: "#fff",
		color: "#64748b",
		fontSize: 13,
		fontWeight: 500,
		cursor: "pointer",
	},
	toggleBtnActive: {
		background: "#1e293b",
		color: "#fff",
		border: "1.5px solid #1e293b",
	},
	templateBtn: {
		padding: "4px 10px",
		borderRadius: 6,
		border: "1px solid #e2e8f0",
		background: "#f8fafc",
		color: "#374151",
		fontSize: 11,
		fontWeight: 500,
		cursor: "pointer",
	},
	toast: {
		position: "fixed",
		bottom: 24,
		right: 24,
		padding: "12px 18px",
		borderRadius: 10,
		border: "1.5px solid",
		fontSize: 13,
		fontWeight: 500,
		boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
		zIndex: 600,
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
	chartRow: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
		gap: 16,
	},
	chartCard: {
		background: "#fff",
		borderRadius: 14,
		padding: "1.25rem 1.5rem",
		border: "1px solid #e8edf2",
		boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
	},
	chartTitle: {
		fontSize: 14,
		fontWeight: 700,
		color: "#0f172a",
		marginBottom: 4,
	},
};
