import React from "react";
const statusColors = {
	OPEN: "bg-blue-100 text-blue-800",
	IN_PROGRESS: "bg-amber-100 text-amber-800",
	RESOLVED: "bg-green-100 text-green-800",
	CLOSED: "bg-gray-100 text-gray-800",
	REJECTED: "bg-red-100 text-red-800",
	PENDING: "bg-yellow-100 text-yellow-800",
	APPROVED: "bg-green-100 text-green-800",
	CANCELLED: "bg-gray-100 text-gray-800",
	ACTIVE: "bg-green-100 text-green-800",
	OUT_OF_SERVICE: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }) {
	const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
		>
			{status.replace(/_/g, " ")}
		</span>
	);
}
