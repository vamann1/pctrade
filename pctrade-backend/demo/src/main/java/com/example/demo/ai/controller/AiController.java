package com.example.demo.ai.controller;

import com.example.demo.ai.dto.CompatibilityRequest;
import com.example.demo.ai.dto.CompatibilityResponse;
import com.example.demo.ai.service.GroqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}