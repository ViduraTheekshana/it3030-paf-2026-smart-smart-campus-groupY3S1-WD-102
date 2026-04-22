package com.smartcampus.server.dto.response;

import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import com.smartcampus.server.util.SlaPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TicketSummaryResponse {

    private UUID id;
    private String title;
    private String location;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String reportedByName;
    private String assignedToName;
    private int attachmentCount;
    private int commentCount;
    private LocalDateTime createdAt;

    // SLA fields
    private long minutesElapsed;
    private long firstResponseDeadlineMinutes;
    private long resolutionDeadlineMinutes;
    private boolean firstResponseBreached;
    private boolean resolutionBreached;
    private boolean firstResponseMet;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;

    public static TicketSummaryResponse from(Ticket t) {
        return TicketSummaryResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .location(t.getLocation())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .reportedByName(t.getReportedBy().getFullName())
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null)
                .attachmentCount(t.getAttachments().size())
                .commentCount(t.getComments().size())
                .createdAt(t.getCreatedAt())
                .minutesElapsed(Duration.between(t.getCreatedAt(), LocalDateTime.now()).toMinutes())
                .firstResponseDeadlineMinutes(SlaPolicy.forPriority(t.getPriority()).firstResponse().toMinutes())
                .resolutionDeadlineMinutes(SlaPolicy.forPriority(t.getPriority()).resolution().toMinutes())
                .firstResponseBreached(SlaPolicy.isFirstResponseBreached(t))
                .resolutionBreached(SlaPolicy.isResolutionBreached(t))
                .firstResponseMet(t.getFirstResponseAt() != null)
                .firstResponseAt(t.getFirstResponseAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }
}
