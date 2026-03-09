package com.example.demo.transactions.controller;

import com.example.demo.transactions.dto.InitiateTransactionRequest;
import com.example.demo.transactions.dto.TransactionResponse;
import com.example.demo.transactions.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transactions/initiate")
    public ResponseEntity<TransactionResponse> initiate(
            @RequestBody InitiateTransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        return ResponseEntity.ok(transactionService.initiate(request, userDetails.getUsername()));
    }

    @PostMapping("/webhooks/stripe")
    public ResponseEntity<Void> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) throws Exception {
        transactionService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}