package com.pctrade.pctrade_backend.dto;

import lombok.Data;

@Data
public class ReviewRequestDto {
    private Long transactionId; // Pentru ce comandă lăsăm recenzia
    private Long reviewerId;    // Cine dă nota (Cumpărătorul)
    private Integer rating;     // Nota de la 1 la 5
    private String comment;     // Mesajul recenziei
}