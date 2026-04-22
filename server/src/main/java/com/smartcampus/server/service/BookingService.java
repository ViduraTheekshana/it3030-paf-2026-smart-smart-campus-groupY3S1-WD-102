package com.smartcampus.server.service;

import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.event.BookingStatusChangedEvent;
import com.smartcampus.server.model.Resource;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.BookingRepository;
import com.smartcampus.server.repository.ResourceRepository;
import com.smartcampus.server.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;
    //Notification Part
    @Autowired
    private ApplicationEventPublisher publisher;

    @Autowired
    private UserRepository userRepository;

    // CREATE BOOKING
    public Booking createBooking(Booking booking, Long resourceID, Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated. Please login again.");
        }
        // Get authenticated user from SecurityContext
        String email;
        try {
            email = authentication.getName();
        } catch (Exception e) {
            throw new RuntimeException("Invalid authentication token");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        //Get resource
        Resource resource = resourceRepository.findById(resourceID)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        
        // Check resource status
        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new RuntimeException("Resource is not available");
        }
        
        // Check availability time range
        if (booking.getStartTime().isBefore(resource.getAvailabilityStart()) ||
            booking.getEndTime().isAfter(resource.getAvailabilityEnd())) {
            throw new RuntimeException("Booking outside resource availability time");
        }

        List<Booking> conflicts = bookingRepository
            .findConflictingBookings(
        resource,
        booking.getDate(),
        booking.getStartTime(),
        booking.getEndTime()
    );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked for this resource!");
        }

        // Set values
        booking.setResource(resource);
        booking.setUser(user);
        booking.setStatus("PENDING");

        return bookingRepository.save(booking);
    }

    // READ ALL
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithUserAndResource();
    }

    // READ BY ID
    public Booking getBooking(Long id) {
        return bookingRepository.findBookingByIdWithUserAndResource(id);
    }

    // UPDATE
    public Booking updateBooking(Long id, Booking updated) {
        Booking booking = getBooking(id);

        booking.setDate(updated.getDate());
        booking.setPurpose(updated.getPurpose());
        booking.setAttendees(updated.getAttendees());
        booking.setStartTime(updated.getStartTime());
        booking.setEndTime(updated.getEndTime());

        return bookingRepository.save(booking);
    }

    // DELETE
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

     // APPROVE
    public Booking approveBooking(Long id) {
        Booking booking = getBooking(id);
        booking.setStatus("APPROVED");

        Booking saved = bookingRepository.save(booking);
        publisher.publishEvent(new BookingStatusChangedEvent(saved));

        return saved;
    }

    // REJECT
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBooking(id);
        booking.setStatus("REJECTED");
        booking.setRejectReason(reason);

        Booking saved = bookingRepository.save(booking);
        publisher.publishEvent(new BookingStatusChangedEvent(saved));

        return saved;
    }
}
