package com.example.demo.marketplace.dto;

import com.example.demo.marketplace.entity.Category;
import com.example.demo.marketplace.entity.ListingStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Category category;
    private ListingStatus status;
    private String sellerUsername;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
}