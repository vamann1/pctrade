package com.pctrade.pctrade_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nota de la 1 la 5
    @Column(nullable = false)
    private Integer rating;

    // Părerea clientului (am lăsat 500 de caractere limită)
    @Column(length = 500)
    private String comment;

    // Cine a lăsat recenzia
    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    // Cine a primit recenzia
    @ManyToOne
    @JoinColumn(name = "reviewed_user_id", nullable = false)
    private User reviewedUser;

    // O tranzacție poate avea O SINGURĂ recenzie (OneToOne)
    @OneToOne
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private Transaction transaction;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}