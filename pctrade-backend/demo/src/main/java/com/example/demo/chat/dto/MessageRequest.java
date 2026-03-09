package com.example.demo.chat.dto;

import com.example.demo.chat.entity.MessageType;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MessageRequest {
    private Long receiverId;
    private Long listingId;
    private MessageType type;
    private String content;
    private String imageUrl;
    private BigDecimal offerAmount;
}