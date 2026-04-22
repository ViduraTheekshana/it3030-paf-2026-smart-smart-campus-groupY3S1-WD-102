package com.smartcampus.server.repository;

import com.smartcampus.server.entity.Ticket;
import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import com.smartcampus.server.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    // Admin: see all tickets with optional filters
    @Query("""
            SELECT t FROM Ticket t
            WHERE (:status IS NULL OR t.status = :status)
            AND (:category IS NULL OR t.category = :category)
            AND (:priority IS NULL OR t.priority = :priority)
            AND (:search IS NULL
                 OR LOWER(CAST(t.title AS String)) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
                 OR LOWER(CAST(t.description AS String)) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            """)
    Page<Ticket> findAllWithFilters(
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("search") String search,
            Pageable pageable
    );

    // Technician: see ONLY tickets assigned to them with optional filters
    @Query("""
            SELECT t FROM Ticket t
            WHERE t.assignedTo.id = :technicianId
            AND (:status IS NULL OR t.status = :status)
            AND (:category IS NULL OR t.category = :category)
            AND (:priority IS NULL OR t.priority = :priority)
            AND (:search IS NULL
                 OR LOWER(CAST(t.title AS String)) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
                 OR LOWER(CAST(t.description AS String)) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            """)
    Page<Ticket> findByAssignedToWithFilters(
            @Param("technicianId") Long technicianId,
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("search") String search,
            Pageable pageable
    );

    // Regular user: see only their own tickets with optional filters
    @Query("""
            SELECT t FROM Ticket t
            WHERE t.reportedBy.id = :userId
            AND (:status IS NULL OR t.status = :status)
            AND (:category IS NULL OR t.category = :category)
            AND (:search IS NULL
                 OR LOWER(CAST(t.title AS String)) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
                 OR LOWER(CAST(t.description AS String)) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            """)
    Page<Ticket> findByUserWithFilters(
            @Param("userId") Long userId,
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("search") String search,
            Pageable pageable
    );
}