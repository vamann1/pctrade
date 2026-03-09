package com.example.demo.transactions.repository;

import com.example.demo.transactions.entity.Transaction;
import com.example.demo.transactions.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBuyerId(Long buyerId);
    List<Transaction> findBySellerId(Long sellerId);
    Optional<Transaction> findByStripePaymentIntentId(String paymentIntentId);
}