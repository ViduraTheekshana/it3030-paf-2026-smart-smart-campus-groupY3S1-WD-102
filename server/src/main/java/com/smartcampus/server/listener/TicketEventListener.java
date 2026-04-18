package com.smartcampus.server.listener;

import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.event.TicketStatusChangedEvent;
import com.smartcampus.server.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class TicketEventListener {

    private final NotificationService notificationService;

    public TicketEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleTicketStatusChange(TicketStatusChangedEvent event) {

        Ticket ticket = event.getTicket();

        if (ticket.getReportedBy() == null) {
            return;
        }

        notificationService.notifyTicketStatusChanged(
                ticket.getReportedBy(),
                ticket.getId(),              // UUID ✅
                ticket.getStatus().name()
        );
    }
}
