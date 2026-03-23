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
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cine trimite mesajul
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // Cine primește mesajul
    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // Despre ce produs discută
    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    // Conținutul mesajului (am pus lungime mai mare pentru mesaje lungi)
    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "message_type")
    private String messageType; // "text" sau "price_offer"

    @Column(name = "offered_price")
    private BigDecimal offeredPrice;

    @Column(name = "offer_status")
    private String offerStatus; // "pending", "accepted", "rejected"

    // Când a fost trimis
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}