package com.pctrade.pctrade_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class SellerHistoryDto {
    private Long transactionId;
    private String listingTitle;
    private BigDecimal price;
    private String status;
    private String buyerName; // Diferența e aici: vânzătorul vrea să știe cine e clientul!
}