package com.smartcampus.server.service;

import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.model.Resource;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.BookingRepository;
import com.smartcampus.server.repository.ResourceRepository;
import com.smartcampus.server.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE BOOKING
    public Booking createBooking(Booking booking, Long resourceID, Long userId) {
        
        //Get resource
        Resource resource = resourceRepository.findById(resourceID)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check resource status
        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new RuntimeException("Resource is not available");
        }
        
        // Check availability time range
        if (booking.getStartTime().isBefore(resource.getAvailabilityStart()) ||
            booking.getEndTime().isAfter(resource.getAvailabilityEnd())) {
            throw new RuntimeException("Booking outside resource availability time");
        }

        // Conflict check per resource
        List<Booking> conflicts = bookingRepository
                .findByResourceAndDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        resource,
                        booking.getDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
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
        return bookingRepository.findAll();
    }

    // READ BY ID
    public Booking getBooking(Long id) {
        return bookingRepository.findById(id)
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
        return bookingRepository.save(booking);
    }

    // REJECT
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBooking(id);
        booking.setStatus("REJECTED");
        booking.setRejectReason(reason);
        return bookingRepository.save(booking);
    }
}
