package com.pctrade.pctrade_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "listings")
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private BigDecimal price;
    private String category; // Ex: GPU, CPU, RAM
    private String condition; // Ex: New, Used
    private String brand;
    private String model;
    private String location;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User seller; // Cine vinde produsul
    // În clasa Listing.java
    private boolean isAvailable = true; // Implicit, orice anunț nou este disponibil
}