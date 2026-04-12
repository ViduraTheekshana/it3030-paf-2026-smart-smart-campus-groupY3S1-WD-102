package com.smartcampus.server.repository;

import com.smartcampus.server.model.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserUserIdAndReadFalse(Long userId);
}
