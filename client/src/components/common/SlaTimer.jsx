import React, { useEffect, useState } from "react";
import { ClockIcon, CheckCircleIcon } from "lucide-react";

function formatTimeRemaining(deadlineMinutes, elapsedMinutes) {
    const remaining = deadlineMinutes - elapsedMinutes;

    if (remaining <= 0) {
        const overdue = Math.abs(remaining);
        if (overdue < 60) return `Overdue by ${overdue}m`;
        if (overdue < 1440) {
            const h = Math.floor(overdue / 60);
            const m = overdue % 60;
            return m > 0 ? `Overdue by ${h}h ${m}m` : `Overdue by ${h}h`;
        }
        const d = Math.floor(overdue / 1440);
        const h = Math.floor((overdue % 1440) / 60);
        return h > 0 ? `Overdue by ${d}d ${h}h` : `Overdue by ${d}d`;
    }

    if (remaining < 60) return `${remaining}m`;
    if (remaining < 1440) {
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    const d = Math.floor(remaining / 1440);
    const h = Math.floor((remaining % 1440) / 60);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

function barColor(percent, breached, met) {
    if (met) return "bg-green-500";
    if (breached) return "bg-red-500";
    if (percent >= 99) return "bg-red-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-blue-500";
}

function SlaRow({ label, deadlineMinutes, elapsedMinutes, breached, met, metLabel }) {
    const percent = Math.min(100, Math.round((elapsedMinutes / deadlineMinutes) * 100));
    const color = barColor(percent, breached, met);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">{label}</span>
                {met ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        {metLabel}
                    </span>
                ) : (
                    <span className={`font-medium ${breached ? "text-red-600" : "text-gray-700"}`}>
                        {formatTimeRemaining(deadlineMinutes, elapsedMinutes)}
                    </span>
                )}
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export function SlaTimer({ ticket }) {
    const [elapsed, setElapsed] = useState(ticket.minutesElapsed ?? 0);

    useEffect(() => {
        setElapsed(ticket.minutesElapsed ?? 0);
        const id = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 60_000);
        return () => clearInterval(id);
    }, [ticket.minutesElapsed]);

    const isResolved =
        ticket.status === "RESOLVED" || ticket.status === "CLOSED";

    // A ticket that is no longer OPEN has received a first response (assigned /
    // moved to IN_PROGRESS). Guard against tickets that existed before the SLA
    // migration where firstResponseAt was never stamped.
    const firstResponseMet =
        ticket.firstResponseMet || ticket.status !== "OPEN";

    const firstResponseBreached =
        !firstResponseMet &&
        elapsed > ticket.firstResponseDeadlineMinutes;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    SLA Status
                </h3>
            </div>

            <SlaRow
                label="First Response"
                deadlineMinutes={ticket.firstResponseDeadlineMinutes}
                elapsedMinutes={elapsed}
                breached={firstResponseBreached}
                met={firstResponseMet}
                metLabel="Met ✓"
            />

            <SlaRow
                label="Resolution"
                deadlineMinutes={ticket.resolutionDeadlineMinutes}
                elapsedMinutes={elapsed}
                breached={ticket.resolutionBreached && !isResolved}
                met={isResolved}
                metLabel="Resolved ✓"
            />
        </div>
    );
}
