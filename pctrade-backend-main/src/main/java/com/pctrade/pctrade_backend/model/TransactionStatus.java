package com.pctrade.pctrade_backend.model;

public enum TransactionStatus {
    PENDING,    // Tranzacția abia a fost inițiată
    PAID,       // Cumpărătorul a confirmat plata
    SHIPPED,    // Vânzătorul a trimis produsul
    COMPLETED,  // Cumpărătorul a confirmat primirea
    CANCELLED   // Tranzacția a fost anulată
}