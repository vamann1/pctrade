package com.pctrade.pctrade_backend.service;

import com.pctrade.pctrade_backend.model.Notification;
import com.pctrade.pctrade_backend.model.User;
import com.pctrade.pctrade_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(User user, String type, String message, String link) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .link(link)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }
}