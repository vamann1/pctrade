package com.example.demo.ai.service;

import com.example.demo.ai.dto.CompatibilityRequest;
import com.example.demo.ai.dto.CompatibilityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GroqService {

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.model}")
    private String model;

    private final RestTemplate restTemplate;

    public CompatibilityResponse checkCompatibility(CompatibilityRequest request) {
        String prompt = "Check PC component compatibility for: " + String.join(", ", request.getComponents()) +
                ". Give a brief compatibility analysis.";

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                entity,
                Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String result = (String) message.get("content");

        CompatibilityResponse compatibilityResponse = new CompatibilityResponse();
        compatibilityResponse.setResult(result);
        return compatibilityResponse;
    }
}