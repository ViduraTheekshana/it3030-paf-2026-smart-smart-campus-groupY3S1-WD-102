package com.smartcampus.server.dto;

import java.util.List;

public class NotificationSummaryDTO {
    private long unreadCount;
    private List<NotificationDTO> notifications;

    public NotificationSummaryDTO(long unreadCount, List<NotificationDTO> notifications) {
        this.unreadCount = unreadCount;
        this.notifications = notifications;
    }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
    public List<NotificationDTO> getNotifications() { return notifications; }
    public void setNotifications(List<NotificationDTO> notifications) { this.notifications = notifications; }
}
