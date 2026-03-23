package com.pctrade.pctrade_backend.repository;

import com.pctrade.pctrade_backend.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>,JpaSpecificationExecutor<Listing> {
    // Metodă pentru a găsi toate anunțurile unei anumite categorii (ex: GPU)
    List<Listing> findByCategory(String category);
    // Metodă pentru a vedea toate anunțurile postate de un anumit vânzător
    List<Listing> findBySellerId(Long sellerId);
}