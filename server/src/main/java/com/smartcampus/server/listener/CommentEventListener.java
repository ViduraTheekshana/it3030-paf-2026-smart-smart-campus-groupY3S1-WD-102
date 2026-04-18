package com.smartcampus.server.listener;

import com.smartcampus.server.entity.TicketComment;
import com.smartcampus.server.event.CommentCreatedEvent;
import com.smartcampus.server.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class CommentEventListener {

    private final NotificationService notificationService;

    public CommentEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleNewComment(CommentCreatedEvent event) {

        // ✅ FIX: get comment from event
        TicketComment comment = event.getComment();

        if (comment.getTicket() == null || comment.getTicket().getReportedBy() == null) {
            return;
        }

        // 🔥 avoid notifying yourself
        if (comment.getAuthor() != null &&
            comment.getAuthor().getUserId()
                .equals(comment.getTicket().getReportedBy().getUserId())) {
            return;
        }

        notificationService.notifyNewComment(
                comment.getTicket().getReportedBy(),
                comment.getTicket().getId()   // UUID ✅
        );
    }
}
