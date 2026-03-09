package com.example.demo.transactions.entity;

import com.example.demo.auth.entity.User;
import com.example.demo.marketplace.entity.Listing;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User seller;

    @ManyToOne
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.INITIATED;

    private String stripePaymentIntentId;

    private BigDecimal amount;

    private LocalDateTime createdAt = LocalDateTime.now();
}