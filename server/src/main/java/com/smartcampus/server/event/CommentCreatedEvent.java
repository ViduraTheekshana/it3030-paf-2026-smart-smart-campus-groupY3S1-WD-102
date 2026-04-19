package com.smartcampus.server.event;

import com.smartcampus.server.entity.TicketComment;

public class CommentCreatedEvent {

    private final TicketComment comment;

    public CommentCreatedEvent(TicketComment comment) {
        this.comment = comment;
    }

    public TicketComment getComment() {
        return comment;
    }
}
