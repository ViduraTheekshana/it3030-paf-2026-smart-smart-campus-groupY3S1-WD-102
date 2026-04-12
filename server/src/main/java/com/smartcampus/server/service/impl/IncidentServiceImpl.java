package com.smartcampus.server.service.impl;

import com.smartcampus.server.dto.request.AssignTicketRequest;
import com.smartcampus.server.dto.request.CreateCommentRequest;
import com.smartcampus.server.dto.request.CreateTicketRequest;
import com.smartcampus.server.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.server.dto.response.AttachmentResponse;
import com.smartcampus.server.dto.response.CommentResponse;
import com.smartcampus.server.dto.response.TicketResponse;
import com.smartcampus.server.dto.response.TicketSummaryResponse;
import com.smartcampus.server.model.Resource;
import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.entity.TicketAttachment;
import com.smartcampus.server.entity.TicketComment;
import com.smartcampus.server.entity.User;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import com.smartcampus.server.exception.AccessDeniedException;
import com.smartcampus.server.exception.InvalidStatusTransitionException;
import com.smartcampus.server.exception.ResourceNotFoundException;
import com.smartcampus.server.repository.TicketAttachmentRepository;
import com.smartcampus.server.repository.TicketCommentRepository;
import com.smartcampus.server.repository.TicketRepository;
import com.smartcampus.server.repository.UserRepository;
import com.smartcampus.server.service.IncidentService;
import com.smartcampus.server.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentServiceImpl implements IncidentService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final FileStorageUtil fileStorageUtil;

    // Defines which status transitions are legal
    private static final Map<TicketStatus, Set<TicketStatus>> VALID_TRANSITIONS = Map.of(
            TicketStatus.OPEN,        Set.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED),
            TicketStatus.IN_PROGRESS, Set.of(TicketStatus.RESOLVED, TicketStatus.OPEN),
            TicketStatus.RESOLVED,    Set.of(TicketStatus.CLOSED),
            TicketStatus.CLOSED,      Set.of(),
            TicketStatus.REJECTED,    Set.of()
    );

    @Override
    public TicketResponse createTicket(CreateTicketRequest request, UUID currentUserId) {
        User reporter = findUser(currentUserId);

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .category(request.getCategory())
                .priority(request.getPriority())
                .preferredContact(request.getPreferredContact())
                .reportedBy(reporter)
                .status(TicketStatus.OPEN)
                .build();

        if (request.getResourceId() != null) {
            Resource resource = new Resource();
            resource.setResourceID(request.getResourceId());
            ticket.setResource(resource);
        }

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketSummaryResponse> getAllTickets(
            TicketStatus status, TicketCategory category, TicketPriority priority,
            UUID currentUserId, String currentUserRole, Pageable pageable) {

        if (isAdminOrTechnician(currentUserRole)) {
            return ticketRepository
                    .findAllWithFilters(status, category, priority, pageable)
                    .map(TicketSummaryResponse::from);
        }
        return ticketRepository
                .findByUserWithFilters(currentUserId, status, category, pageable)
                .map(TicketSummaryResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicket(UUID ticketId, UUID currentUserId, String currentUserRole) {
        Ticket ticket = findTicket(ticketId);
        if (!isAdminOrTechnician(currentUserRole)
                && !ticket.getReportedBy().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not have access to this ticket");
        }
        return TicketResponse.from(ticket);
    }

    @Override
    public TicketResponse updateTicketStatus(UUID ticketId, UpdateTicketStatusRequest request,
                                              UUID currentUserId, String currentUserRole) {
        Ticket ticket = findTicket(ticketId);
        TicketStatus newStatus = request.getStatus();

        validateTransition(ticket.getStatus(), newStatus);

        if (newStatus == TicketStatus.REJECTED && !isAdminOrTechnician(currentUserRole)) {
            throw new AccessDeniedException("Only admin or technician can reject a ticket");
        }

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED && request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        if (newStatus == TicketStatus.REJECTED && request.getRejectionReason() != null) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse assignTicket(UUID ticketId, AssignTicketRequest request,
                                        String currentUserRole) {
        if (!isAdminOrTechnician(currentUserRole)) {
            throw new AccessDeniedException("Only admin or technician can assign tickets");
        }
        Ticket ticket = findTicket(ticketId);
        User technician = findUser(request.getTechnicianId());
        ticket.setAssignedTo(technician);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        return TicketResponse.from(ticketRepository.save(ticket));
    }

    @Override
    public void deleteTicket(UUID ticketId, String currentUserRole) {
        if (!"ADMIN".equals(currentUserRole)) {
            throw new AccessDeniedException("Only admin can delete tickets");
        }
        ticketRepository.delete(findTicket(ticketId));
    }

    @Override
    public AttachmentResponse uploadAttachment(UUID ticketId, MultipartFile file,
                                                UUID currentUserId) throws IOException {
        Ticket ticket = findTicket(ticketId);

        if (!ticket.getReportedBy().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Only the ticket owner can upload attachments");
        }
        if (attachmentRepository.countByTicketId(ticketId) >= 3) {
            throw new IllegalArgumentException("Maximum 3 attachments allowed per ticket");
        }

        String filePath = fileStorageUtil.store(file, ticketId);

        TicketAttachment attachment = TicketAttachment.builder()
                .ticket(ticket)
                .filePath(filePath)
                .fileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .build();

        return AttachmentResponse.from(attachmentRepository.save(attachment));
    }

    @Override
    public void deleteAttachment(UUID ticketId, UUID attachmentId,
                                  UUID currentUserId, String currentUserRole) throws IOException {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        boolean isOwner = attachment.getTicket().getReportedBy().getId().equals(currentUserId);
        if (!isOwner && !isAdminOrTechnician(currentUserRole)) {
            throw new AccessDeniedException("You cannot delete this attachment");
        }

        fileStorageUtil.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getAttachmentBytes(UUID attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        try {
            return fileStorageUtil.load(attachment.getFilePath());
        } catch (IOException e) {
            throw new ResourceNotFoundException("File not found on server");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getAttachmentMimeType(UUID attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"))
                .getMimeType();
    }

    @Override
    public CommentResponse addComment(UUID ticketId, CreateCommentRequest request,
                                       UUID currentUserId) {
        Ticket ticket = findTicket(ticketId);
        User author = findUser(currentUserId);

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(request.getContent())
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    @Override
    public CommentResponse updateComment(UUID ticketId, UUID commentId,
                                          CreateCommentRequest request, UUID currentUserId) {
        TicketComment comment = findComment(commentId);
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(UUID ticketId, UUID commentId,
                               UUID currentUserId, String currentUserRole) {
        TicketComment comment = findComment(commentId);
        boolean isOwner = comment.getAuthor().getId().equals(currentUserId);
        if (!isOwner && !"ADMIN".equals(currentUserRole)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    // private helpers

    private Ticket findTicket(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private TicketComment findComment(UUID id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
    }

    private boolean isAdminOrTechnician(String role) {
        return "ADMIN".equals(role) || "TECHNICIAN".equals(role);
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        Set<TicketStatus> allowed = VALID_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(next)) {
            throw new InvalidStatusTransitionException(current.name(), next.name());
        }
    }
}
