package com.smartcampus.server.util;

import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

public class SlaPolicy {

    public record Threshold(Duration firstResponse, Duration resolution) {}

    private static final Map<TicketPriority, Threshold> POLICY = Map.of(
        TicketPriority.CRITICAL, new Threshold(Duration.ofHours(1),   Duration.ofHours(4)),
        TicketPriority.HIGH,     new Threshold(Duration.ofHours(4),   Duration.ofHours(24)),
        TicketPriority.MEDIUM,   new Threshold(Duration.ofHours(8),   Duration.ofHours(72)),
        TicketPriority.LOW,      new Threshold(Duration.ofHours(24),  Duration.ofHours(168))
    );

    public static Threshold forPriority(TicketPriority priority) {
        return POLICY.getOrDefault(priority, POLICY.get(TicketPriority.LOW));
    }

    public static boolean isFirstResponseBreached(Ticket ticket) {
        if (ticket.getFirstResponseAt() != null) return false;
        Duration elapsed = Duration.between(ticket.getCreatedAt(), LocalDateTime.now());
        return elapsed.compareTo(forPriority(ticket.getPriority()).firstResponse()) > 0;
    }

    public static boolean isResolutionBreached(Ticket ticket) {
        TicketStatus s = ticket.getStatus();
        if (s == TicketStatus.RESOLVED || s == TicketStatus.CLOSED || s == TicketStatus.REJECTED) return false;
        Duration elapsed = Duration.between(ticket.getCreatedAt(), LocalDateTime.now());
        return elapsed.compareTo(forPriority(ticket.getPriority()).resolution()) > 0;
    }
}
