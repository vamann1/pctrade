package com.pctrade.pctrade_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponseDto {
    private Integer rating;
    private String comment;
    private String reviewerName; // Doar numele celui care a dat nota!
    private LocalDateTime createdAt;
}