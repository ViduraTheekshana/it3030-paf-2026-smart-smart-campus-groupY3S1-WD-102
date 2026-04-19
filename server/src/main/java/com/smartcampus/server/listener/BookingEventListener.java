package com.smartcampus.server.listener;

import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.event.BookingStatusChangedEvent;
import com.smartcampus.server.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class BookingEventListener {

    private final NotificationService notificationService;

    public BookingEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleBookingStatusChange(BookingStatusChangedEvent event) {

        Booking booking = event.getBooking();

        if ("APPROVED".equalsIgnoreCase(booking.getStatus())) {
            notificationService.notifyBookingApproved(
                    booking.getUser(),
                    booking.getBookingId(),
                    booking.getResource().getName()
            );
        }

        if ("REJECTED".equalsIgnoreCase(booking.getStatus())) {
            notificationService.notifyBookingRejected(
                    booking.getUser(),
                    booking.getBookingId(),
                    booking.getRejectReason()
            );
        }
    }
}
