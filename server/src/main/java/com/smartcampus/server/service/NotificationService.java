package com.smartcampus.server.service;

import com.smartcampus.server.dto.CreateNotificationRequest;
import com.smartcampus.server.dto.NotificationDTO;
import com.smartcampus.server.dto.NotificationSummaryDTO;
import com.smartcampus.server.exception.ResourceNotFoundException;
import com.smartcampus.server.model.Notification;
import com.smartcampus.server.model.NotificationType;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.NotificationRepository;
import com.smartcampus.server.repository.UserRepository;
import java.util.List;
import java.util.UUID;
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
        List<NotificationDTO> items = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::fromEntity)
                .toList();

        long unread = notificationRepository.countByUserUserIdAndReadFalse(userId);
        return new NotificationSummaryDTO(unread, items);
    }

    @Transactional
    public NotificationDTO create(CreateNotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getUserId()));

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
        List<Notification> notifications = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
        return getMyNotifications(userId);
    }

    @Transactional
    public void delete(Long notificationId, Long userId) {
        Notification notification = getOwnedNotification(notificationId, userId);
        notificationRepository.delete(notification);
    }
    @Transactional
public long getUnreadCount(Long userId) {
    return notificationRepository.countByUserUserIdAndReadFalse(userId);
}
    @Transactional
    public NotificationDTO notifyBookingApproved(User user, Long bookingId, String resourceName) {
        return createAutomatic(
                user,
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " + resourceName + " has been approved.",
                "/bookings/" + bookingId
        );
    }

    @Transactional
    public NotificationDTO notifyBookingRejected(User user, Long bookingId, String reason) {
        return createAutomatic(
                user,
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking was rejected. Reason: " + reason,
                "/bookings/" + bookingId
        );
    }

    @Transactional
    public NotificationDTO notifyBookingCancelled(User user, Long bookingId, String resourceName) {
        return createAutomatic(
                user,
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                "Your booking for " + resourceName + " has been cancelled.",
                "/bookings/" + bookingId
        );
    }

    @Transactional
public void notifyTicketStatusChanged(User user, UUID ticketId, String status) {
    createAutomatic(
            user,
            NotificationType.TICKET_STATUS_CHANGED,
            "Ticket Status Updated",
            "Your ticket status changed to " + status + ".",
            "/tickets/" + ticketId
    );
}

@Transactional
public void notifyNewComment(User user, UUID ticketId) {
    createAutomatic(
            user,
            NotificationType.NEW_COMMENT,
            "New Comment",
            "A new comment was added to your ticket.",
            "/tickets/" + ticketId
    );
}
    @Transactional
    public NotificationDTO notifySystemAlert(User user, String title, String message, String actionUrl) {
        return createAutomatic(
                user,
                NotificationType.SYSTEM_ALERT,
                title,
                message,
                actionUrl
        );
    }

    private NotificationDTO createAutomatic(
            User user,
            NotificationType type,
            String title,
            String message,
            String actionUrl
    ) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);

        return NotificationDTO.fromEntity(notificationRepository.save(notification));
    }

    private Notification getOwnedNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));

        if (!notification.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for current user.");
        }

        return notification;
    }
}
