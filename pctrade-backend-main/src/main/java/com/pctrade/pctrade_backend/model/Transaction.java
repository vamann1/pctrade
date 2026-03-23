package com.pctrade.pctrade_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Produsul care este cumpărat
    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    // Cine cumpără produsul (User-ul curent)
    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    // Salvăm prețul la momentul cumpărării (în caz că vânzătorul îl modifică mai târziu)
    @Column(nullable = false)
    private BigDecimal priceAtPurchase;

    // Statusul curent al comenzii
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}