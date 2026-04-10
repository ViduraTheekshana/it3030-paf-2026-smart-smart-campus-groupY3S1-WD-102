package com.smartcampus.server.repository;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.server.model.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Conflict checking
    List<Booking> findByDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime
    );
}
