package com.example.demo.marketplace.dto;

import com.example.demo.marketplace.entity.Category;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ListingRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private Category category;
}