package com.example.demo.transactions.service;

import com.example.demo.auth.entity.User;
import com.example.demo.auth.repository.UserRepository;
import com.example.demo.marketplace.entity.Listing;
import com.example.demo.marketplace.repository.ListingRepository;
import com.example.demo.transactions.dto.InitiateTransactionRequest;
import com.example.demo.transactions.dto.TransactionResponse;
import com.example.demo.transactions.entity.Transaction;
import com.example.demo.transactions.entity.TransactionStatus;
import com.example.demo.transactions.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    public TransactionResponse initiate(InitiateTransactionRequest request, String buyerEmail) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(listing.getPrice().multiply(new java.math.BigDecimal("100")).longValue())
                .setCurrency("ron")
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Transaction transaction = new Transaction();
        transaction.setBuyer(buyer);
        transaction.setSeller(listing.getSeller());
        transaction.setListing(listing);
        transaction.setAmount(listing.getPrice());
        transaction.setStripePaymentIntentId(paymentIntent.getId());
        transactionRepository.save(transaction);

        return toResponse(transaction, paymentIntent.getClientSecret());
    }

    public void handleWebhook(String payload, String sigHeader) throws Exception {
        com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                payload, sigHeader, System.getenv("STRIPE_WEBHOOK_SECRET"));

        if ("payment_intent.succeeded".equals(event.getType())) {
            com.stripe.model.StripeObject stripeObject = event.getDataObjectDeserializer()
                    .getObject().orElseThrow();
            PaymentIntent intent = (PaymentIntent) stripeObject;
            transactionRepository.findByStripePaymentIntentId(intent.getId())
                    .ifPresent(t -> {
                        t.setStatus(TransactionStatus.FUNDS_LOCKED);
                        transactionRepository.save(t);
                    });
        }
    }

    private TransactionResponse toResponse(Transaction t, String clientSecret) {
        TransactionResponse response = new TransactionResponse();
        response.setId(t.getId());
        response.setListingId(t.getListing().getId());
        response.setBuyerUsername(t.getBuyer().getUsername());
        response.setSellerUsername(t.getSeller().getUsername());
        response.setStatus(t.getStatus());
        response.setStripePaymentIntentId(t.getStripePaymentIntentId());
        response.setClientSecret(clientSecret);
        response.setAmount(t.getAmount());
        response.setCreatedAt(t.getCreatedAt());
        return response;
    }
}