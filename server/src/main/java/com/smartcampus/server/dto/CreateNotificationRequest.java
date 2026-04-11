package com.smartcampus.server.dto;

import com.smartcampus.server.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateNotificationRequest {
    @NotNull
    private Long userId;
    @NotNull
    private NotificationType type;
    @NotBlank @Size(max = 180)
    private String title;
    @NotBlank @Size(max = 1000)
    private String message;
    @Size(max = 255)
    private String actionUrl;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
}
