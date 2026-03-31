package com.pctrade.pctrade_backend.repository;

import com.pctrade.pctrade_backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pctrade.pctrade_backend.model.TransactionStatus;
import java.util.List;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByBuyerId(Long buyerId);
    List<Transaction> findByListingSellerId(Long sellerId);
    boolean existsByBuyerIdAndListingIdAndStatusNotIn(
            Long buyerId, Long listingId, List<TransactionStatus> statuses);

}

