package com.example.demo.chat.dto;

import com.example.demo.chat.entity.MessageType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private Long id;
    private String senderUsername;
    private String receiverUsername;
    private Long listingId;
    private MessageType type;
    private String content;
    private String imageUrl;
    private BigDecimal offerAmount;
    private LocalDateTime createdAt;
}