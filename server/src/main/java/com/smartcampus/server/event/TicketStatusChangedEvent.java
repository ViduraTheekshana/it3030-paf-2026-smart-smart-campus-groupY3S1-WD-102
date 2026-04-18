package com.smartcampus.server.event;

import com.smartcampus.server.entity.Ticket;

public class TicketStatusChangedEvent {

    private final Ticket ticket;

    public TicketStatusChangedEvent(Ticket ticket) {
        this.ticket = ticket;
    }

    public Ticket getTicket() {
        return ticket;
    }
}
