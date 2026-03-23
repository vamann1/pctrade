package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.dto.ReviewRequestDto;
import com.pctrade.pctrade_backend.dto.ReviewResponseDto;
import com.pctrade.pctrade_backend.model.Review;
import com.pctrade.pctrade_backend.model.Transaction;
import com.pctrade.pctrade_backend.model.TransactionStatus;
import com.pctrade.pctrade_backend.repository.ReviewRepository;
import com.pctrade.pctrade_backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final TransactionRepository transactionRepository;

    @PostMapping
    public Review addReview(@RequestBody ReviewRequestDto request) {

        // 1. Găsim tranzacția
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Tranzacția nu a fost găsită!"));

        // 2. Regula 1: Comanda trebuie să fie finalizată!
        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new RuntimeException("Poți lăsa o recenzie doar pentru comenzile finalizate!");
        }

        // 3. Regula 2: Cumpărătorul trebuie să fie cel care lasă recenzia!
        if (!transaction.getBuyer().getId().equals(request.getReviewerId())) {
            throw new RuntimeException("Doar cumpărătorul poate lăsa o recenzie pentru această tranzacție!");
        }

        // 4. Regula 3: O singură recenzie per tranzacție!
        if (reviewRepository.existsByTransactionId(transaction.getId())) {
            throw new RuntimeException("Ai lăsat deja o recenzie pentru această comandă!");
        }

        // 5. Creăm și salvăm recenzia
        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .reviewer(transaction.getBuyer())
                .reviewedUser(transaction.getListing().getSeller()) // Extragem vânzătorul automat!
                .transaction(transaction)
                .build();

        return reviewRepository.save(review);
    }
    @GetMapping("/seller/{sellerId}")
    public List<ReviewResponseDto> getSellerReviews(@PathVariable Long sellerId) {

        // 1. Căutăm toate recenziile unde acest user este "reviewedUser" (adică a primit nota)
        List<Review> reviews = reviewRepository.findByReviewedUserId(sellerId);

        // 2. Le transformăm în DTO-uri curate
        return reviews.stream().map(review -> ReviewResponseDto.builder()
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerName(review.getReviewer().getUsername())
                .createdAt(review.getCreatedAt())
                .build()
        ).toList();
    }
}