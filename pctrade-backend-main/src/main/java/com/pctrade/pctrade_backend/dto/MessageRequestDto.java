package com.pctrade.pctrade_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MessageRequestDto {
    private Long senderId;
    private Long receiverId;
    private Long listingId;
    private String content;
    private String messageType; // "text" sau "price_offer"
    private BigDecimal offeredPrice;
}