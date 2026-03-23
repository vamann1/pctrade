package com.pctrade.pctrade_backend.repository;

import com.pctrade.pctrade_backend.model.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    // Spring va înțelege automat să aducă pozele care au acest listing_id
    List<ListingImage> findByListingId(Long listingId);
}