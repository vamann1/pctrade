package com.pctrade.pctrade_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
public class ReviewResponseDto {
    private Integer rating;
    private String comment;
    private String reviewerName;
    private LocalDateTime createdAt;
    private String listingTitle;
    private BigDecimal listingPrice;
}