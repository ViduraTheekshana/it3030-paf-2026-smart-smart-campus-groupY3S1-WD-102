import React from "react";
export function LoadingSkeleton({ count = 3, height = "h-24" }) {
	return (
		<div className="space-y-4">
			{Array.from({
				length: count,
			}).map((_, i) => (
				<div
					key={i}
					className={`${height} bg-gray-200 rounded-lg animate-pulse`}
				></div>
			))}
		</div>
	);
}
