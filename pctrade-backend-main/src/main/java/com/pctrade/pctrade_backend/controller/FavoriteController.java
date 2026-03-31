package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.model.*;
import com.pctrade.pctrade_backend.repository.*;
import com.pctrade.pctrade_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getFavorites(@PathVariable Long userId) {
        return favoriteRepository.findByUserId(userId).stream().map(fav -> {
            Listing l = fav.getListing();
            Map<String, Object> dto = new HashMap<>();
            dto.put("favoriteId", fav.getId());
            dto.put("listingId", l.getId());
            dto.put("title", l.getTitle());
            dto.put("price", l.getPrice());
            dto.put("category", l.getCategory() != null ? l.getCategory() : "");
            dto.put("condition", l.getCondition() != null ? l.getCondition() : "");
            dto.put("available", l.isAvailable());
            dto.put("location", l.getLocation() != null ? l.getLocation() : "");
            dto.put("sellerUsername", l.getSeller() != null ? l.getSeller().getUsername() : "");
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{userId}/check/{listingId}")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long userId,
            @PathVariable Long listingId) {
        return ResponseEntity.ok(favoriteRepository.existsByUserIdAndListingId(userId, listingId));
    }

    @PostMapping
    public ResponseEntity<?> addFavorite(
            @RequestParam Long userId,
            @RequestParam Long listingId) {

        if (favoriteRepository.existsByUserIdAndListingId(userId, listingId)) {
            return ResponseEntity.badRequest().body("Deja adăugat la favorite!");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Userul nu a fost găsit!"));
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .listing(listing)
                .build();

        favoriteRepository.save(favorite);
        return ResponseEntity.ok("Adăugat la favorite!");
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> removeFavorite(
            @RequestParam Long userId,
            @RequestParam Long listingId) {
        favoriteRepository.deleteByUserIdAndListingId(userId, listingId);
        return ResponseEntity.ok("Eliminat din favorite!");
    }
}