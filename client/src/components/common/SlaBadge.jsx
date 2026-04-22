import React from "react";
import { AlertTriangleIcon, ClockIcon, CheckCircleIcon } from "lucide-react";

export function SlaBadge({ ticket }) {
    const { status, resolutionBreached } = ticket;

    if (status === "RESOLVED" || status === "CLOSED" || status === "REJECTED") {
        return null;
    }

    // Non-OPEN tickets have been responded to — guard against pre-migration tickets
    // where firstResponseAt was never stamped even though assignment already happened.
    const firstResponseMet = ticket.firstResponseMet || status !== "OPEN";

    if (resolutionBreached) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                <AlertTriangleIcon className="h-3 w-3" />
                SLA Breached
            </span>
        );
    }

    if (!firstResponseMet && status === "OPEN") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                <ClockIcon className="h-3 w-3" />
                Awaiting Response
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircleIcon className="h-3 w-3" />
            On Track
        </span>
    );
}
