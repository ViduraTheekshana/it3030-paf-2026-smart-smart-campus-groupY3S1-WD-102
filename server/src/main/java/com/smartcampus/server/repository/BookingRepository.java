package com.smartcampus.server.repository;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.model.Resource;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Conflict checking
    List<Booking> findByResourceAndDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            Resource resource,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime
    );

   
}
