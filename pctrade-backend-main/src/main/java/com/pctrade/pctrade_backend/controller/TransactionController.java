package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.dto.SellerHistoryDto;
import com.pctrade.pctrade_backend.dto.TransactionHistoryDto;
import com.pctrade.pctrade_backend.model.*;
import com.pctrade.pctrade_backend.repository.*;
import com.pctrade.pctrade_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @PostMapping
    public Transaction createTransaction(@RequestParam Long buyerId, @RequestParam Long listingId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Cumpărătorul nu a fost găsit!"));

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));

        if (listing.getSeller() == null) {
            throw new RuntimeException("Eroare: Acest anunț este vechi și nu are un vânzător valid!");
        }

        if (listing.getSeller().getId().equals(buyer.getId())) {
            throw new RuntimeException("Nu poți cumpăra propriul produs!");
        }

        Transaction transaction = Transaction.builder()
                .buyer(buyer)
                .listing(listing)
                .priceAtPurchase(listing.getPrice())
                .status(TransactionStatus.PENDING)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        notificationService.createNotification(
                listing.getSeller(),
                "purchase",
                buyer.getUsername() + " a cumpărat " + listing.getTitle() + " pentru " + listing.getPrice() + " RON",
                "/profile/listings"
        );

        return savedTransaction;
    }

    @PatchMapping("/{id}/status")
    public Transaction updateTransactionStatus(
            @PathVariable Long id,
            @RequestParam TransactionStatus status) {

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tranzacția nu a fost găsită!"));

        transaction.setStatus(status);

        if (status == TransactionStatus.COMPLETED) {
            Listing listing = transaction.getListing();
            listing.setAvailable(false);
            listingRepository.save(listing);
        }

        Transaction savedTransaction = transactionRepository.save(transaction);

        switch (status) {
            case PAID:
                notificationService.createNotification(
                        transaction.getListing().getSeller(),
                        "purchase",
                        transaction.getBuyer().getUsername() + " a plătit pentru " + transaction.getListing().getTitle() + ". Confirmă că vei trimite produsul!",
                        "/profile/transactions"
                );
                break;
            case CONFIRMED_BY_SELLER:
                notificationService.createNotification(
                        transaction.getBuyer(),
                        "new_message",
                        transaction.getListing().getSeller().getUsername() + " a confirmat că va trimite " + transaction.getListing().getTitle() + ". Așteaptă coletul!",
                        "/profile/transactions"
                );
                break;
            case SHIPPED:
                notificationService.createNotification(
                        transaction.getBuyer(),
                        "new_message",
                        transaction.getListing().getSeller().getUsername() + " a expediat " + transaction.getListing().getTitle() + ". Confirmă primirea când ajunge!",
                        "/profile/transactions"
                );
                break;
            case COMPLETED:
                notificationService.createNotification(
                        transaction.getListing().getSeller(),
                        "offer_accepted",
                        transaction.getBuyer().getUsername() + " a confirmat primirea pentru " + transaction.getListing().getTitle() + ". Banii au fost eliberați!",
                        "/profile/transactions"
                );
                break;
            case CANCELLED:
                notificationService.createNotification(
                        transaction.getListing().getSeller(),
                        "offer_rejected",
                        "Tranzacția pentru " + transaction.getListing().getTitle() + " a fost anulată de cumpărător.",
                        "/profile/transactions"
                );
                break;
            default:
                break;
        }

        return savedTransaction;
    }

    @GetMapping("/buyer/{buyerId}")
    public List<TransactionHistoryDto> getBuyerHistory(@PathVariable Long buyerId) {
        List<Transaction> transactions = transactionRepository.findByBuyerId(buyerId);

        return transactions.stream().map(transaction -> {
            return TransactionHistoryDto.builder()
                    .transactionId(transaction.getId())
                    .listingTitle(transaction.getListing().getTitle())
                    .price(transaction.getPriceAtPurchase())
                    .status(transaction.getStatus().name())
                    .sellerName(transaction.getListing().getSeller().getUsername())
                    .listingAvailable(transaction.getListing().isAvailable()) // Adauga asta
                    .build();
        }).toList();
    }

    @GetMapping("/seller/{sellerId}")
    public List<SellerHistoryDto> getSellerHistory(@PathVariable Long sellerId) {
        List<Transaction> transactions = transactionRepository.findByListingSellerId(sellerId);

        return transactions.stream().map(transaction -> {
            return SellerHistoryDto.builder()
                    .transactionId(transaction.getId())
                    .listingTitle(transaction.getListing().getTitle())
                    .price(transaction.getPriceAtPurchase())
                    .status(transaction.getStatus().name())
                    .buyerName(transaction.getBuyer().getUsername())
                    .listingAvailable(transaction.getListing().isAvailable())
                    .build();
        }).toList();
    }

    @GetMapping("/active")
    public ResponseEntity<Boolean> hasActiveTransaction(
            @RequestParam Long buyerId,
            @RequestParam Long listingId) {
        boolean exists = transactionRepository
                .existsByBuyerIdAndListingIdAndStatusNotIn(
                        buyerId, listingId,
                        List.of(TransactionStatus.CANCELLED, TransactionStatus.COMPLETED)
                );
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tranzacția nu a fost găsită!"));
        return ResponseEntity.ok(transaction);
    }
}