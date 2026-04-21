import React from "react";
import { InboxIcon } from "lucide-react";
export function EmptyState({
	title,
	description,
	icon: Icon = InboxIcon,
	action,
}) {
	return (
		<div className="text-center py-16 px-6">
			<div className="mx-auto h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
				<Icon className="h-8 w-8 text-gray-400" />
			</div>
			<h3 className="text-base font-semibold text-gray-900">{title}</h3>
			<p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
				{description}
			</p>
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
