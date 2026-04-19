package com.smartcampus.server.event;

import com.smartcampus.server.entity.Booking;

public class BookingStatusChangedEvent {

    private final Booking booking;

    public BookingStatusChangedEvent(Booking booking) {
        this.booking = booking;
    }

    public Booking getBooking() {
        return booking;
    }
}
