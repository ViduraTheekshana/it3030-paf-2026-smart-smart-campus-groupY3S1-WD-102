package com.smartcampus.server.service;

import com.smartcampus.server.model.Booking;
import com.smartcampus.server.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository repository;

    // CREATE
    public Booking createBooking(Booking booking) {

        // set default status
        booking.setStatus("PENDING");

        // conflict check
        List<Booking> conflicts = repository
                .findByDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        booking.getDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked!");
        }

        return repository.save(booking);
    }

    // READ ALL
    public List<Booking> getAllBookings() {
        return repository.findAll();
    }

    // READ BY ID
    public Booking getBooking(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // UPDATE
    public Booking updateBooking(Long id, Booking updated) {
        Booking booking = getBooking(id);

        booking.setDate(updated.getDate());
        booking.setPurpose(updated.getPurpose());
        booking.setAttendees(updated.getAttendees());
        booking.setStartTime(updated.getStartTime());
        booking.setEndTime(updated.getEndTime());

        return repository.save(booking);
    }

    // DELETE
    public void deleteBooking(Long id) {
        repository.deleteById(id);
    }

    // APPROVE
    public Booking approveBooking(Long id) {
        Booking booking = getBooking(id);
        booking.setStatus("APPROVED");
        return repository.save(booking);
    }

    // REJECT
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBooking(id);
        booking.setStatus("REJECTED");
        booking.setRejectReason(reason);
        return repository.save(booking);
    }
}