import React from "react";

const priorityConfig = {
	CRITICAL: {
		dot: "bg-red-500",
		bg: "bg-red-50",
		text: "text-red-700",
		border: "border-red-200",
	},
	HIGH: {
		dot: "bg-orange-500",
		bg: "bg-orange-50",
		text: "text-orange-700",
		border: "border-orange-200",
	},
	MEDIUM: {
		dot: "bg-yellow-500",
		bg: "bg-yellow-50",
		text: "text-yellow-700",
		border: "border-yellow-200",
	},
	LOW: {
		dot: "bg-gray-400",
		bg: "bg-gray-50",
		text: "text-gray-600",
		border: "border-gray-200",
	},
};

export function PriorityBadge({ priority }) {
	const config = priorityConfig[priority] || priorityConfig.LOW;
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
		>
			<span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
			{priority}
		</span>
	);
}
