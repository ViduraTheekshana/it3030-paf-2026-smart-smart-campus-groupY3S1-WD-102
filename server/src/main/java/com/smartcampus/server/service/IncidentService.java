package com.smartcampus.server.service;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface IncidentService {

    TicketResponse createTicket(CreateTicketRequest request, Long currentUserId);

    Page<TicketSummaryResponse> getAllTickets(
            TicketStatus status, TicketCategory category, TicketPriority priority, String search,
            Long currentUserId, String currentUserRole, Pageable pageable);

    TicketResponse getTicket(UUID ticketId, Long currentUserId, String currentUserRole);

    TicketResponse updateTicketStatus(UUID ticketId, UpdateTicketStatusRequest request,
                                      Long currentUserId, String currentUserRole);

    TicketResponse assignTicket(UUID ticketId, AssignTicketRequest request, String currentUserRole);

    void deleteTicket(UUID ticketId, String currentUserRole);

    AttachmentResponse uploadAttachment(UUID ticketId, MultipartFile file,
                                        Long currentUserId) throws IOException;

    void deleteAttachment(UUID ticketId, UUID attachmentId,
                          Long currentUserId, String currentUserRole) throws IOException;

    byte[] getAttachmentBytes(UUID attachmentId);

    String getAttachmentMimeType(UUID attachmentId);

    CommentResponse addComment(UUID ticketId, CreateCommentRequest request, Long currentUserId);

    CommentResponse updateComment(UUID ticketId, UUID commentId,
                                  CreateCommentRequest request, Long currentUserId);

    void deleteComment(UUID ticketId, UUID commentId, Long currentUserId, String currentUserRole);
}
