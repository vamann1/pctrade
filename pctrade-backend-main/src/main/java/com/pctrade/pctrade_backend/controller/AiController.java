package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.dto.CompatibilityRequest;
import com.pctrade.pctrade_backend.dto.CompatibilityResponse;
import com.pctrade.pctrade_backend.service.GroqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pctrade.pctrade_backend.dto.AiChatRequest;
import com.pctrade.pctrade_backend.dto.AiChatResponse;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GroqService groqService;

    @PostMapping("/compatibility-check")
    public ResponseEntity<CompatibilityResponse> checkCompatibility(
            @RequestBody CompatibilityRequest request) {
        return ResponseEntity.ok(groqService.checkCompatibility(request));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(groqService.chat(request));
    }

    @GetMapping("/similar")
    public ResponseEntity<AiChatResponse> getSimilar(
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String productModel,
            @RequestParam java.math.BigDecimal price,
            @RequestParam Long listingId) {
        return ResponseEntity.ok(groqService.getSimilarSuggestions(title, category, brand, productModel, price, listingId));
    }
}