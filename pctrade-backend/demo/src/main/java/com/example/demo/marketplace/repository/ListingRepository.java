package com.example.demo.marketplace.repository;

import com.example.demo.marketplace.entity.Category;
import com.example.demo.marketplace.entity.Listing;
import com.example.demo.marketplace.entity.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long>,
        JpaSpecificationExecutor<Listing> {
    List<Listing> findByCategory(Category category);
    List<Listing> findByStatus(ListingStatus status);
    List<Listing> findBySellerId(Long sellerId);
}