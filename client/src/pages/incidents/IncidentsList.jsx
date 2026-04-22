import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getIncidents } from "../../services/incidents";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { EmptyState } from "../../components/common/EmptyState";
import {
	SearchIcon,
	PlusIcon,
	MapPinIcon,
	ClockIcon,
	UserIcon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export function IncidentsList() {
	const [incidents, setIncidents] = useState([]);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	const role = user?.role;
	const isAdmin = role === "ROLE_ADMIN";
	const isTechnician = role === "ROLE_TECHNICIAN";
	const isUser = role === "ROLE_USER";

	const [filters, setFilters] = useState({
		status: "",
		priority: "",
		category: "",
		search: "",
	});

	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const pageSize = 10;

	const [statusCounts, setStatusCounts] = useState({
		OPEN: 0,
		IN_PROGRESS: 0,
		RESOLVED: 0,
		CLOSED: 0,
	});

	// 1. Fetch Incidents (Table Data)
	useEffect(() => {
		const fetchIncidents = async () => {
			setLoading(true);
			try {
				const apiParams = { ...filters, page: currentPage, size: pageSize, sort: "createdAt,desc" };

				// Securely enforce role-based viewing
				if (isUser) {
					apiParams.reporterId = user?.userId || user?.id;
				} else if (isTechnician) {
					apiParams.assignedTo = user?.userId || user?.id;
				}

				// Clean up empty parameters before sending the request
				Object.keys(apiParams).forEach((key) => {
					if (
						apiParams[key] === "" ||
						apiParams[key] === null ||
						apiParams[key] === undefined
					) {
						delete apiParams[key];
					}
				});

				const response = await getIncidents(apiParams);

				setIncidents(response.content || []);
				setTotalPages(response.totalPages || 0);
			} catch (error) {
				console.error("Failed to load incidents:", error);
				toast.error("Failed to load tickets. Please try again.");
				setIncidents([]);
			} finally {
				setLoading(false);
			}
		};

		const timeoutId = setTimeout(() => {
			fetchIncidents();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [filters, currentPage, isUser, isTechnician, user?.id, user?.userId]);

	// 2. Fetch Status Counts (For the top cards)
	useEffect(() => {
		const fetchCounts = async () => {
			try {
				const baseParams = { size: 1 }; // Only need the totalElements metadata

				// Securely enforce role-based counting
				if (isUser) {
					baseParams.reporterId = user?.userId || user?.id;
				} else if (isTechnician) {
					baseParams.assignedTo = user?.userId || user?.id;
				}

				const [openRes, inProgressRes, resolvedRes, closedRes] =
					await Promise.all([
						getIncidents({ ...baseParams, status: "OPEN" }),
						getIncidents({ ...baseParams, status: "IN_PROGRESS" }),
						getIncidents({ ...baseParams, status: "RESOLVED" }),
						getIncidents({ ...baseParams, status: "CLOSED" }),
					]);

				setStatusCounts({
					OPEN: openRes.totalElements || openRes.page?.totalElements || 0,
					IN_PROGRESS:
						inProgressRes.totalElements ||
						inProgressRes.page?.totalElements ||
						0,
					RESOLVED:
						resolvedRes.totalElements || resolvedRes.page?.totalElements || 0,
					CLOSED: closedRes.totalElements || closedRes.page?.totalElements || 0,
				});
			} catch (error) {
				console.error("Failed to load counts:", error);
			}
		};

		fetchCounts();
	}, [isUser, isTechnician, user?.id, user?.userId]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
		setCurrentPage(0);
	};

	const getEmptyStateMessage = () => {
		if (isUser) {
			return {
				title: "You haven't reported any incidents yet",
				description: "Click 'Report Incident' to get started.",
			};
		} else if (isTechnician) {
			return {
				title: "No tickets assigned to you",
				description:
					"You will see tickets here when an admin assigns them to you.",
			};
		}
		return {
			title: "No tickets found",
			description: "Try adjusting your search or filters.",
		};
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						{isUser
							? "My Tickets"
							: isTechnician
								? "Assigned Tickets"
								: "Incidents & Tickets"}
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						{isUser
							? "Your reported maintenance issues"
							: isTechnician
								? "Your assigned campus issues to resolve"
								: "Track and manage campus maintenance issues"}
					</p>
				</div>
				<div className="flex gap-2">
					{(isUser || isAdmin) && (
						<Link
							to="/incidents/new"
							className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
						>
							<PlusIcon className="h-4 w-4" />
							Report Incident
						</Link>
					)}
				</div>
			</div>

			{/* Status summary cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{[
					{
						label: "Open",
						count: statusCounts.OPEN,
						activeClasses: "border-blue-400 ring-2 ring-blue-100",
						filterVal: "OPEN",
					},
					{
						label: "In Progress",
						count: statusCounts.IN_PROGRESS,
						activeClasses: "border-amber-400 ring-2 ring-amber-100",
						filterVal: "IN_PROGRESS",
					},
					{
						label: "Resolved",
						count: statusCounts.RESOLVED,
						activeClasses: "border-green-400 ring-2 ring-green-100",
						filterVal: "RESOLVED",
					},
					{
						label: "Closed",
						count: statusCounts.CLOSED,
						activeClasses: "border-gray-400 ring-2 ring-gray-100",
						filterVal: "CLOSED",
					},
				].map((stat) => (
					<button
						key={stat.label}
						onClick={() => {
							setFilters((prev) => ({
								...prev,
								status: prev.status === stat.filterVal ? "" : stat.filterVal,
							}));
							setCurrentPage(0); // Reset page on status click
						}}
						className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${filters.status === stat.filterVal ? stat.activeClasses : "border-gray-200"}`}
					>
						<p className="text-sm font-medium text-gray-500">{stat.label}</p>
						<p className="text-2xl font-bold text-gray-900 mt-1">
							{stat.count}
						</p>
					</button>
				))}
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 flex-wrap">
				<div className="flex-1 min-w-[200px] relative">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						name="search"
						placeholder="Search tickets..."
						value={filters.search}
						onChange={handleFilterChange}
						className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 outline-none"
					/>
				</div>
				<select
					name="status"
					value={filters.status}
					onChange={handleFilterChange}
					className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 outline-none"
				>
					<option value="">All Statuses</option>
					<option value="OPEN">Open</option>
					<option value="IN_PROGRESS">In Progress</option>
					<option value="RESOLVED">Resolved</option>
					<option value="CLOSED">Closed</option>
					<option value="REJECTED">Rejected</option>
				</select>
				<select
					name="priority"
					value={filters.priority}
					onChange={handleFilterChange}
					className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 outline-none"
				>
					<option value="">All Priorities</option>
					<option value="CRITICAL">Critical</option>
					<option value="HIGH">High</option>
					<option value="MEDIUM">Medium</option>
					<option value="LOW">Low</option>
				</select>
				<select
					name="category"
					value={filters.category}
					onChange={handleFilterChange}
					className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 outline-none"
				>
					<option value="">All Categories</option>
					<option value="ELECTRICAL">Electrical</option>
					<option value="PLUMBING">Plumbing</option>
					<option value="IT">IT</option>
					<option value="EQUIPMENT">Equipment</option>
					<option value="STRUCTURAL">Structural</option>
					<option value="OTHER">Other</option>
				</select>
			</div>

			{/* Ticket list */}
			{loading ? (
				<LoadingSkeleton count={5} height="h-24" />
			) : incidents.length === 0 ? (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200">
					<EmptyState
						title={getEmptyStateMessage().title}
						description={getEmptyStateMessage().description}
					/>
				</div>
			) : (
				<div className="space-y-4">
					<div className="space-y-3">
						{incidents.map((incident, index) => (
							<motion.div
								key={incident.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Link
									to={`/incidents/${incident.id}`}
									className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 group"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap mb-2">
												<span className="text-xs font-mono text-gray-400">
													#{incident.id}
												</span>
												<StatusBadge status={incident.status} />
												<PriorityBadge priority={incident.priority} />
												<span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
													{incident.category}
												</span>
											</div>
											<h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
												{incident.title}
											</h3>
											<p className="text-sm text-gray-500 line-clamp-1 mb-3">
												{incident.description}
											</p>
											<div className="flex items-center gap-4 text-xs text-gray-400">
												<div className="flex items-center gap-1">
													<MapPinIcon className="h-3.5 w-3.5" />
													{incident.location}
												</div>
												<div className="flex items-center gap-1">
													<ClockIcon className="h-3.5 w-3.5" />
													{new Date(incident.createdAt).toLocaleDateString()}
												</div>
												{incident.assignedToName && (
													<div className="flex items-center gap-1">
														<UserIcon className="h-3.5 w-3.5" />
														{incident.assignedToName}
													</div>
												)}
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm">
							<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-gray-700">
										Showing page{" "}
										<span className="font-medium">{currentPage + 1}</span> of{" "}
										<span className="font-medium">{totalPages}</span>
									</p>
								</div>
								<div>
									<nav
										className="isolate inline-flex -space-x-px rounded-md shadow-sm"
										aria-label="Pagination"
									>
										<button
											onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
											disabled={currentPage === 0}
											className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<span className="sr-only">Previous</span>
											<ChevronLeft className="h-5 w-5" aria-hidden="true" />
										</button>

										{/* Simple page indicator for middle */}
										<span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
											{currentPage + 1}
										</span>

										<button
											onClick={() =>
												setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
											}
											disabled={currentPage === totalPages - 1}
											className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<span className="sr-only">Next</span>
											<ChevronRight className="h-5 w-5" aria-hidden="true" />
										</button>
									</nav>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
