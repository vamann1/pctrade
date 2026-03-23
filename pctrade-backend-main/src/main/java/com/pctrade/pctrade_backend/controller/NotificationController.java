package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.model.Notification;
import com.pctrade.pctrade_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @GetMapping("/{userId}/unread-count")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @PatchMapping("/{id}/read")
    public Map<String, Object> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificarea nu a fost găsită!"));
        notification.setRead(true);
        return mapToDto(notificationRepository.save(notification));
    }

    @PatchMapping("/{userId}/read-all")
    public void markAllAsRead(@PathVariable Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private Map<String, Object> mapToDto(Notification notification) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", notification.getId());
        dto.put("type", notification.getType());
        dto.put("message", notification.getMessage());
        dto.put("read", notification.isRead());
        dto.put("link", notification.getLink());
        dto.put("createdAt", notification.getCreatedAt());
        return dto;
    }
}
