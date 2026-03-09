package com.example.demo.transactions.dto;

import com.example.demo.transactions.entity.TransactionStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionResponse {
    private Long id;
    private Long listingId;
    private String buyerUsername;
    private String sellerUsername;
    private TransactionStatus status;
    private String stripePaymentIntentId;
    private String clientSecret;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}