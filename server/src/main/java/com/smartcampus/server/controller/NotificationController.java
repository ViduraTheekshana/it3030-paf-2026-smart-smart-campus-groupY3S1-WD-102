package com.smartcampus.server.controller;

import com.smartcampus.server.dto.NotificationDTO;
import com.smartcampus.server.dto.NotificationSummaryDTO;
import com.smartcampus.server.model.User;
import com.smartcampus.server.service.NotificationService;
import com.smartcampus.server.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<NotificationSummaryDTO> getMine(Authentication authentication) {
        User user = userService.getEntityByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getUserId()));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long notificationId, Authentication authentication) {
        User user = userService.getEntityByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, user.getUserId()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<NotificationSummaryDTO> markAllAsRead(Authentication authentication) {
        User user = userService.getEntityByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.markAllAsRead(user.getUserId()));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> delete(@PathVariable Long notificationId, Authentication authentication) {
        User user = userService.getEntityByEmail(authentication.getName());
        notificationService.delete(notificationId, user.getUserId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
