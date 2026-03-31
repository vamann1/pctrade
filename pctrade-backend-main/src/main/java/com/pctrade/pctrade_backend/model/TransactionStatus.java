package com.pctrade.pctrade_backend.model;

public enum TransactionStatus {
    PENDING,            // Cumpărătorul a făcut request
    PAID,               // Cumpărătorul a plătit - bani blocați în escrow
    CONFIRMED_BY_SELLER, // Vânzătorul confirmă că va trimite
    SHIPPED,            // Vânzătorul a trimis coletul
    COMPLETED,          // Cumpărătorul a confirmat primirea - bani eliberați
    CANCELLED,          // Tranzacție anulată
    DISPUTED            // Dispută deschisă
}