package com.example.demo.marketplace.controller;

import com.example.demo.marketplace.dto.ListingRequest;
import com.example.demo.marketplace.dto.ListingResponse;
import com.example.demo.marketplace.entity.Category;
import com.example.demo.marketplace.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    public ResponseEntity<ListingResponse> create(
            @RequestBody ListingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        return ResponseEntity.ok(listingService.create(request, null, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getAll() {
        return ResponseEntity.ok(listingService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ListingResponse>> getByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(listingService.getByCategory(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        listingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}