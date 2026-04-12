package com.smartcampus.server.dto.response;

import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

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

    public static TicketSummaryResponse from(Ticket t) {
        return TicketSummaryResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .location(t.getLocation())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .reportedByName(t.getReportedBy().getName())
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                .attachmentCount(t.getAttachments().size())
                .commentCount(t.getComments().size())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
