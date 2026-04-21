import React, { useState, cloneElement } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	LayoutDashboardIcon,
	CalendarIcon,
	AlertTriangleIcon,
	BoxesIcon,
	ShieldIcon,
	LogOutIcon,
	GraduationCapIcon,
	MenuIcon,
	XIcon,
	ChevronLeftIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
	const location = useLocation();
	const { logout, isAdmin, isTechnician, isUser, getRoleAccent, user } =
		useAuth();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	// Role-based navigation
	const navigation = [];

	// Everyone sees Dashboard
	navigation.push({
		name: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboardIcon,
	});
	// Everyone sees Resources
	navigation.push({
		name: "Resources",
		href: "/resources",
		icon: BoxesIcon,
	});

	// Role-specific navigation
	if (isUser()) {
		navigation.push({
			name: "My Bookings",
			href: "/bookings",
			icon: CalendarIcon,
		});
		navigation.push({
			name: "My Tickets",
			href: "/incidents",
			icon: AlertTriangleIcon,
		});
	} else if (isTechnician() && !isAdmin()) {
		navigation.push({
			name: "Assigned Tickets",
			href: "/incidents?assigned=me",
			icon: AlertTriangleIcon,
		});
		navigation.push({
			name: "All Tickets",
			href: "/incidents",
			icon: AlertTriangleIcon,
		});
	} else if (isAdmin()) {
		navigation.push({
			name: "All Bookings",
			href: "/bookings",
			icon: CalendarIcon,
		});
		navigation.push({
			name: "All Tickets",
			href: "/incidents",
			icon: AlertTriangleIcon,
		});
		navigation.push({
			name: "Admin Panel",
			href: "/admin",
			icon: ShieldIcon,
		});
	}
	const roleAccent = getRoleAccent();
	const borderAccentClass =
		{
			"red-600": "border-red-600",
			"blue-600": "border-blue-600",
			"indigo-600": "border-indigo-600",
		}[roleAccent] || "border-indigo-600";
	const renderNav = (isCollapsed) => (
		<div
			className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 border-l-4 ${borderAccentClass} ${isCollapsed ? "w-20" : "w-64"}`}
		>
			{/* Brand */}
			<div className="p-5 flex items-center gap-3 border-b border-white/10">
				<div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
					<GraduationCapIcon className="h-5 w-5 text-white" />
				</div>
				{!isCollapsed && (
					<div className="overflow-hidden">
						<h1 className="text-lg font-bold text-white leading-tight">
							Campus Hub
						</h1>
						<p className="text-[11px] text-blue-300/60 font-medium">
							Operations Center
						</p>
					</div>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-3 py-4 space-y-1">
				{navigation.map((item) => {
					const isActive =
						location.pathname === item.href ||
						(item.href !== "/dashboard" &&
							location.pathname.startsWith(item.href));
					return (
						<Link
							key={item.name}
							to={item.href}
							onClick={() => setMobileOpen(false)}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? "bg-white/15 text-white shadow-sm" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}
							title={isCollapsed ? item.name : undefined}
						>
							<item.icon
								className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`}
							/>
							{!isCollapsed && <span>{item.name}</span>}
						</Link>
					);
				})}
			</nav>

			{/* Collapse toggle (desktop only) */}
			{!mobileOpen && (
				<div className="hidden lg:block px-3 py-2 border-t border-white/10">
					<button
						onClick={() => setCollapsed(!collapsed)}
						className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-white transition-all"
					>
						<ChevronLeftIcon
							className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
						/>
						{!isCollapsed && <span>Collapse</span>}
					</button>
				</div>
			)}

			{/* Logout */}
			<div className="px-3 py-3 border-t border-white/10">
				<button
					onClick={logout}
					className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all"
				>
					<LogOutIcon className="h-5 w-5 flex-shrink-0" />
					{!isCollapsed && <span>Sign Out</span>}
				</button>
			</div>
		</div>
	);
	return (
		<>
			{/* Mobile menu button */}
			<button
				onClick={() => setMobileOpen(true)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
			>
				<MenuIcon className="h-5 w-5" />
			</button>

			{/* Mobile overlay */}
			<AnimatePresence>
				{mobileOpen && (
					<>
						<motion.div
							initial={{
								opacity: 0,
							}}
							animate={{
								opacity: 1,
							}}
							exit={{
								opacity: 0,
							}}
							className="lg:hidden fixed inset-0 bg-black/50 z-40"
							onClick={() => setMobileOpen(false)}
						/>
						<motion.div
							initial={{
								x: -280,
							}}
							animate={{
								x: 0,
							}}
							exit={{
								x: -280,
							}}
							transition={{
								type: "spring",
								damping: 25,
								stiffness: 300,
							}}
							className="lg:hidden fixed inset-y-0 left-0 z-50"
						>
							<div className="relative h-full">
								{renderNav(false)}
								<button
									onClick={() => setMobileOpen(false)}
									className="absolute top-4 right-4 p-1 text-white/60 hover:text-white"
								>
									<XIcon className="h-5 w-5" />
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Desktop sidebar */}
			<div className="hidden lg:block flex-shrink-0">
				{renderNav(collapsed)}
			</div>
		</>
	);
}
