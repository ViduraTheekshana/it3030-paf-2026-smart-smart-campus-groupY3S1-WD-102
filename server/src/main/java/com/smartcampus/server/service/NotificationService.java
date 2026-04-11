package com.smartcampus.server.service;

import com.smartcampus.server.dto.CreateNotificationRequest;
import com.smartcampus.server.dto.NotificationDTO;
import com.smartcampus.server.dto.NotificationSummaryDTO;
import com.smartcampus.server.exception.ResourceNotFoundException;
import com.smartcampus.server.model.Notification;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.NotificationRepository;
import com.smartcampus.server.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public NotificationSummaryDTO getMyNotifications(Long userId) {
        List<NotificationDTO> items = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::fromEntity)
                .toList();
        long unread = notificationRepository.countByUser_UserIdAndReadFalse(userId);
        return new NotificationSummaryDTO(unread, items);
    }

    @Transactional
    public NotificationDTO create(CreateNotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setActionUrl(request.getActionUrl());
        return NotificationDTO.fromEntity(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = getOwnedNotification(notificationId, userId);
        notification.setRead(true);
        return NotificationDTO.fromEntity(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationSummaryDTO markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
        return getMyNotifications(userId);
    }

    @Transactional
    public void delete(Long notificationId, Long userId) {
        Notification notification = getOwnedNotification(notificationId, userId);
        notificationRepository.delete(notification);
    }

    private Notification getOwnedNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for current user.");
        }
        return notification;
    }
}
