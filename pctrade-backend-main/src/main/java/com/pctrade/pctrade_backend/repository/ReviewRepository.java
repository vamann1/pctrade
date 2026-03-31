package com.pctrade.pctrade_backend.repository;

import com.pctrade.pctrade_backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Găsește toate recenziile primite de un anumit utilizator (vânzător)
    List<Review> findByReviewedUserId(Long reviewedUserId);

    List<Review> findByReviewerId(Long reviewerId);

    // Verifică dacă există deja o recenzie pentru o anumită tranzacție
    boolean existsByTransactionId(Long transactionId);
}