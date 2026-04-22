package com.smartcampus.server.repository;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.model.Resource;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource = :resource
        AND b.date = :date
        AND (
            (b.startTime < :endTime AND b.endTime > :startTime)
        )
    """)
        List<Booking> findConflictingBookings(
        Resource resource,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime
);

   
}
