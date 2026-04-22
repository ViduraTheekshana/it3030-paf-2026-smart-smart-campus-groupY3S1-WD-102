import React from "react";
import { useAuth } from "../../context/AuthContext";
import { NotificationPanel } from "../notifications/NotificationPanel";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
	"/dashboard": "Dashboard",
	"/resources": "Resources",
	"/bookings": "Bookings",
	"/incidents": "Incidents",
	"/incidents/new": "Report Incident",
	"/admin": "Admin Panel",
};

export function Header() {
	const { user, isAdmin, isTechnician } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const getPageTitle = () => {
		for (const [path, title] of Object.entries(pageTitles)) {
			if (location.pathname === path) return title;
		}
		if (location.pathname.startsWith("/incidents/")) return "Incident Detail";
		return "Campus Hub";
	};

	const roleLabel = isAdmin()
		? "Admin"
		: isTechnician()
			? "Technician"
			: "User";

	const roleBadgeColor = isAdmin()
		? "bg-red-50 text-red-700 border border-red-200"
		: isTechnician()
			? "bg-blue-50 text-blue-700 border border-blue-200"
			: "bg-gray-50 text-gray-600 border border-gray-200";

	return (
		<header className="bg-white border-b border-gray-200 px-6 py-4">
			<div className="flex items-center justify-between">
				<div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
				<div className="hidden lg:block">
					<h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
				</div>
				<div className="flex items-center gap-4">
					<NotificationPanel />
					<div className="flex items-center gap-3 pl-4 border-l border-gray-200">
						<button
							onClick={() => navigate("/profile")}
							className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
							title="View Profile"
						>
							<span className="text-white font-semibold text-sm">
								{user?.fullName?.charAt(0)?.toUpperCase()}
							</span>
						</button>
						<div>
							<p className="text-sm font-medium text-gray-900 leading-tight">
								{user?.fullName}
							</p>
							<span
								className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleBadgeColor}`}
							>
								{roleLabel}
							</span>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
