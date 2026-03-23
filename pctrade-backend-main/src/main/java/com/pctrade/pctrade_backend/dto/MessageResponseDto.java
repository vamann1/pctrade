package com.pctrade.pctrade_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
public class MessageResponseDto {
    private Long id;
    private Long senderId;
    private String senderName; // Trimitem DOAR numele expeditorului, nu tot obiectul User!
    private String content;
    private LocalDateTime createdAt;
    private String messageType;
    private BigDecimal offeredPrice;
    private String offerStatus;
}