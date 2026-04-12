package com.smartcampus.server.dto.response;

import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import com.smartcampus.server.model.Resource;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TicketResponse {

    private UUID id;
    private String title;
    private String description;
    private String location;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String preferredContact;
    private String resolutionNotes;
    private String rejectionReason;
    private Long resourceId;
    private String resourceName;
    private UUID reportedById;
    private String reportedByName;
    private UUID assignedToId;
    private String assignedToName;
    private List<AttachmentResponse> attachments;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketResponse from(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .location(t.getLocation())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .preferredContact(t.getPreferredContact())
                .resolutionNotes(t.getResolutionNotes())
                .rejectionReason(t.getRejectionReason())
                .resourceId(t.getResource() != null ? t.getResource().getResourceID() : null)
                .resourceName(t.getResource() != null ? t.getResource().getName() : null)
                .reportedById(t.getReportedBy().getId())
                .reportedByName(t.getReportedBy().getName())
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
                .attachments(t.getAttachments().stream().map(AttachmentResponse::from).toList())
                .comments(t.getComments().stream().map(CommentResponse::from).toList())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
