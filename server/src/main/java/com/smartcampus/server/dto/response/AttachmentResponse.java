package com.smartcampus.server.dto.response;

import com.smartcampus.server.entity.TicketAttachment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AttachmentResponse {

    private UUID id;
    private String fileName;
    private String mimeType;
    private String url;
    private LocalDateTime createdAt;

    public static AttachmentResponse from(TicketAttachment a) {
        return AttachmentResponse.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .mimeType(a.getMimeType())
                .url("/api/incidents/" + a.getTicket().getId() + "/attachments/" + a.getId())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
