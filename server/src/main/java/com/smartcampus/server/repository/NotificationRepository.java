package com.smartcampus.server.repository;

import com.smartcampus.server.model.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    long countByUser_UserIdAndReadFalse(Long userId);
}
