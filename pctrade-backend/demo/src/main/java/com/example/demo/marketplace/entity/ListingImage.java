package com.example.demo.marketplace.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "listing_images")
@Data
public class ListingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "listing_id")
    private Listing listing;
}