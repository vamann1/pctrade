package com.pctrade.pctrade_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class TransactionHistoryDto {
    private Long transactionId;
    private String listingTitle;   // Vrem doar titlul produsului, nu tot obiectul
    private BigDecimal price;      // Prețul plătit
    private String status;         // Ex: PENDING, COMPLETED, CANCELLED
    private String sellerName;     // De la cine a cumpărat
}