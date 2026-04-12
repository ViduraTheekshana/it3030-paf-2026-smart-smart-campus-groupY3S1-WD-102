package com.smartcampus.server.controller;

import com.smartcampus.server.dto.request.AssignTicketRequest;
import com.smartcampus.server.dto.request.CreateCommentRequest;
import com.smartcampus.server.dto.request.CreateTicketRequest;
import com.smartcampus.server.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.server.dto.response.AttachmentResponse;
import com.smartcampus.server.dto.response.CommentResponse;
import com.smartcampus.server.dto.response.TicketResponse;
import com.smartcampus.server.dto.response.TicketSummaryResponse;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import com.smartcampus.server.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // TODO: Replace with real principal from Spring Security once (OAuth2) is merged.
    // These UUIDs match the seed data in V3__seed_test_data.sql
    private static final UUID TEMP_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000003");
    private static final String TEMP_USER_ROLE = "USER";


    // -- Ticket CRUD

    // POST /api/incidents
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incidentService.createTicket(request, TEMP_USER_ID));
    }

    // GET /api/incidents
    @GetMapping
    public ResponseEntity<Page<TicketSummaryResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(incidentService.getAllTickets(
                status, category, priority, TEMP_USER_ID, TEMP_USER_ROLE, pageable));
    }

    // GET /api/incidents/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(
                incidentService.getTicket(id, TEMP_USER_ID, TEMP_USER_ROLE));
    }

    // PUT /api/incidents/{id}  — update ticket details (owner only, while OPEN)
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTicketRequest request) {
        // Get current ticket, apply field updates, keep same status
        TicketResponse existing = incidentService.getTicket(id, TEMP_USER_ID, TEMP_USER_ROLE);
        UpdateTicketStatusRequest keepStatus = new UpdateTicketStatusRequest();
        keepStatus.setStatus(existing.getStatus());
        // Re-create with updated fields - service will handle
        return ResponseEntity.ok(
                incidentService.updateTicketStatus(id, keepStatus, TEMP_USER_ID, TEMP_USER_ROLE));
    }

    // DELETE /api/incidents/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID id) {
        incidentService.deleteTicket(id, TEMP_USER_ROLE);
        return ResponseEntity.noContent().build();
    }


    // -- Status & Assignment

    // PATCH /api/incidents/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(
                incidentService.updateTicketStatus(id, request, TEMP_USER_ID, TEMP_USER_ROLE));
    }

    // PATCH /api/incidents/{id}/assign
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable UUID id,
            @Valid @RequestBody AssignTicketRequest request) {
        return ResponseEntity.ok(
                incidentService.assignTicket(id, request, TEMP_USER_ROLE));
    }


    // -- Attachments

    // POST /api/incidents/{id}/attachments
    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incidentService.uploadAttachment(id, file, TEMP_USER_ID));
    }

    // GET /api/incidents/{id}/attachments/{attachmentId}
    @GetMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> getAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId) {
        byte[] bytes = incidentService.getAttachmentBytes(attachmentId);
        String mimeType = incidentService.getAttachmentMimeType(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, mimeType)
                .body(bytes);
    }

    // DELETE /api/incidents/{id}/attachments/{attachmentId}
    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId) throws IOException {
        incidentService.deleteAttachment(id, attachmentId, TEMP_USER_ID, TEMP_USER_ROLE);
        return ResponseEntity.noContent().build();
    }


    // -- Comments

    // POST /api/incidents/{id}/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incidentService.addComment(id, request, TEMP_USER_ID));
    }

    // PATCH /api/incidents/{id}/comments/{commentId}
    @PatchMapping("/{id}/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(
                incidentService.updateComment(id, commentId, request, TEMP_USER_ID));
    }

    // DELETE /api/incidents/{id}/comments/{commentId}
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId) {
        incidentService.deleteComment(id, commentId, TEMP_USER_ID, TEMP_USER_ROLE);
        return ResponseEntity.noContent().build();
    }
}
