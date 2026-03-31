package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.model.Listing;
import com.pctrade.pctrade_backend.model.ListingImage;
import com.pctrade.pctrade_backend.model.User;
import com.pctrade.pctrade_backend.repository.ListingImageRepository;
import com.pctrade.pctrade_backend.repository.ListingRepository;
import com.pctrade.pctrade_backend.repository.UserRepository;
import com.pctrade.pctrade_backend.service.MinioService;
import com.pctrade.pctrade_backend.specification.ListingSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import com.pctrade.pctrade_backend.model.Favorite;
import com.pctrade.pctrade_backend.repository.FavoriteRepository;
import com.pctrade.pctrade_backend.service.NotificationService;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final MinioService minioService;
    private final ListingImageRepository listingImageRepository;
    private final FavoriteRepository favoriteRepository;
    private final NotificationService notificationService;

    @GetMapping
    public List<Listing> getFilteredListings(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        // 1. Creăm "regula" de filtrare pe baza datelor primite
        Specification<Listing> spec = ListingSpecification.filterListings(category, condition, minPrice, maxPrice);

        // 2. Cerem bazei de date doar anunțurile care respectă regula
        return listingRepository.findAll(spec);
    }

    @PostMapping
    public Listing createListing(@RequestBody Listing listing, @RequestParam Long sellerId) {
        // 1. Găsim utilizatorul în baza de date după ID
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit!"));

        // 2. Îl setăm ca vânzător al acestui anunț
        listing.setSeller(seller);

        // 3. Salvăm anunțul (acum va avea un seller atașat!)
        return listingRepository.save(listing);
    }

    @GetMapping("/category/{category}")
    public List<Listing> getByCategory(@PathVariable String category) {
        return listingRepository.findByCategory(category);
    }

    @GetMapping("/{id}")
    public Listing getListingById(@PathVariable Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));
    }

    @PostMapping("/{id}/images")
    public String uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));

        String fileName = minioService.uploadFile(file);

        ListingImage image = ListingImage.builder()
                .imageUrl(fileName)
                .listing(listing) // Legăm poza de anunțul găsit
                .build();

        listingImageRepository.save(image);

        return "Imagine încărcată și salvată în DB cu succes: " + fileName;
    }
    /**
     * API: GET http://localhost:8080/api/listings/seller/1
     * Scop: Aduce toate anunțurile (produsele) postate de un anumit vânzător.
     */
    @GetMapping("/seller/{sellerId}")
    public List<Listing> getListingsBySeller(@PathVariable Long sellerId) {
        // AICI folosim metoda pe care tocmai ai creat-o în Repository!
        return listingRepository.findBySellerId(sellerId);
    }
    /**
     * API: GET http://localhost:8080/api/listings/1/images
     * Scop: Aduce toate pozele (galeria) pentru anunțul cu ID-ul 1.
     */
    @GetMapping("/{id}/images")
    public List<ListingImage> getListingImages(@PathVariable Long id) {
        // AICI folosim repository-ul de imagini!
        return listingImageRepository.findByListingId(id);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateListing(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));

        if (updates.containsKey("title")) listing.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) listing.setDescription((String) updates.get("description"));
        if (updates.containsKey("condition")) listing.setCondition((String) updates.get("condition"));
        if (updates.containsKey("category")) listing.setCategory((String) updates.get("category"));
        if (updates.containsKey("brand")) listing.setBrand((String) updates.get("brand"));
        if (updates.containsKey("model")) listing.setModel((String) updates.get("model"));
        if (updates.containsKey("location")) listing.setLocation((String) updates.get("location"));
        if (updates.containsKey("price")) {
            listing.setPrice(new java.math.BigDecimal(updates.get("price").toString()));
        }

        if (updates.containsKey("price")) {
            java.math.BigDecimal newPrice = new java.math.BigDecimal(updates.get("price").toString());
            java.math.BigDecimal oldPrice = listing.getPrice();
            listing.setPrice(newPrice);

            // Notifica utilizatorii care au la favorite
            if (!newPrice.equals(oldPrice)) {
                List<Favorite> favorites = favoriteRepository.findByListingId(id);
                // Adauga in FavoriteRepository: List<Favorite> findByListingId(Long listingId);
                for (Favorite fav : favorites) {
                    notificationService.createNotification(
                            fav.getUser(),
                            "price_offer",
                            "Prețul pentru \"" + listing.getTitle() + "\" s-a modificat: " + oldPrice + " RON → " + newPrice + " RON",
                            "/listing/" + listing.getId()
                    );
                }
            }
        }

        return ResponseEntity.ok(listingRepository.save(listing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));

        // Notifica utilizatorii care au la favorite
        List<Favorite> favorites = favoriteRepository.findByListingId(id);
        for (Favorite fav : favorites) {
            notificationService.createNotification(
                    fav.getUser(),
                    "offer_rejected",
                    "Anunțul \"" + listing.getTitle() + "\" a fost șters de vânzător și nu mai este disponibil.",
                    "/browse"
            );
        }

        listingRepository.delete(listing);
        return ResponseEntity.ok("Anunț șters cu succes!");
    }
}