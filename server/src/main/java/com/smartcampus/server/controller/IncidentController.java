package com.smartcampus.server.controller;

import com.smartcampus.server.dto.request.AssignTicketRequest;
import com.smartcampus.server.dto.request.CreateCommentRequest;
import com.smartcampus.server.dto.request.CreateTicketRequest;
import com.smartcampus.server.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.server.dto.response.AttachmentResponse;
import com.smartcampus.server.dto.response.CommentResponse;
import com.smartcampus.server.dto.response.TicketResponse;
import com.smartcampus.server.dto.response.TicketSummaryResponse;
import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import com.smartcampus.server.exception.AccessDeniedException;
import com.smartcampus.server.exception.ResourceNotFoundException;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.TicketRepository;
import com.smartcampus.server.repository.UserRepository;
import com.smartcampus.server.service.IncidentService;
import com.smartcampus.server.util.SlaPolicy;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    // Auth helpers
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private Long currentUserId() {
        return currentUser().getUserId();
    }

    private String currentUserRole() {
        return currentUser().getRole().name();
    }


    // SLA summary (admin only)
    @GetMapping("/sla-summary")
    public ResponseEntity<Map<String, Object>> getSlaSummary() {
        if (!"ROLE_ADMIN".equals(currentUserRole())) {
            throw new AccessDeniedException("Only admins can view SLA summary");
        }
        List<Ticket> openTickets = ticketRepository.findAllOpenTickets();

        long breachedFirstResponse = openTickets.stream()
                .filter(SlaPolicy::isFirstResponseBreached)
                .count();

        long breachedResolution = openTickets.stream()
                .filter(SlaPolicy::isResolutionBreached)
                .count();

        long total = openTickets.size();
        int healthPercent = total == 0 ? 100 :
                (int) ((total - breachedResolution) * 100.0 / total);

        return ResponseEntity.ok(Map.of(
                "total", total,
                "breachedFirstResponse", breachedFirstResponse,
                "breachedResolution", breachedResolution,
                "slaHealthPercent", healthPercent
        ));
    }

    // Ticket CRUD
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incidentService.createTicket(request, currentUserId()));
    }

    @GetMapping
    public ResponseEntity<Page<TicketSummaryResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(incidentService.getAllTickets(
                status, category, priority, search, currentUserId(), currentUserRole(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(
                incidentService.getTicket(id, currentUserId(), currentUserRole()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.ok(
                incidentService.updateTicketDetails(id, request, currentUserId(), currentUserRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID id) {
        incidentService.deleteTicket(id, currentUserRole());
        return ResponseEntity.noContent().build();
    }


    // Status & Assignment
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(
                incidentService.updateTicketStatus(id, request, currentUserId(), currentUserRole()));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable UUID id,
            @Valid @RequestBody AssignTicketRequest request) {
        return ResponseEntity.ok(
                incidentService.assignTicket(id, request, currentUserRole()));
    }


    // Attachments
    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incidentService.uploadAttachment(id, file, currentUserId(), currentUserRole()));
    }

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

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId) throws IOException {
        incidentService.deleteAttachment(id, attachmentId, currentUserId(), currentUserRole());
        return ResponseEntity.noContent().build();
    }


    // Comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incidentService.addComment(id, request, currentUserId()));
    }

    @PatchMapping("/{id}/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(
                incidentService.updateComment(id, commentId, request, currentUserId()));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId) {
        incidentService.deleteComment(id, commentId, currentUserId(), currentUserRole());
        return ResponseEntity.noContent().build();
    }
}
