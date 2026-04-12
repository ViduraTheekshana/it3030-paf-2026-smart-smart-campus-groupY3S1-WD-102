package com.smartcampus.server.controller;


import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService service;

    // CREATE
    @PostMapping
    public Booking create(
        @RequestBody Booking booking,
        @RequestParam Long resourceID
    ) {
        return service.createBooking(booking, resourceID);
    }

    // GET ALL
    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id) {
        return service.getBooking(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Booking update(@PathVariable Long id, @RequestBody Booking booking) {
        return service.updateBooking(id, booking);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteBooking(id);
        return "Deleted successfully";
    }

    // APPROVE
    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable Long id) {
        return service.approveBooking(id);
    }

    // REJECT
    @PutMapping("/{id}/reject")
    public Booking reject(
        @PathVariable Long id, 
        @RequestParam String rejectReason) {
        return service.rejectBooking(id, rejectReason);
    }
}
