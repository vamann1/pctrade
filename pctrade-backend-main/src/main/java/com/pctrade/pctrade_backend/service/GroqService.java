package com.pctrade.pctrade_backend.service;

import com.pctrade.pctrade_backend.dto.CompatibilityRequest;
import com.pctrade.pctrade_backend.dto.CompatibilityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.pctrade.pctrade_backend.model.Listing;
import com.pctrade.pctrade_backend.repository.ListingRepository;
import com.pctrade.pctrade_backend.dto.AiChatRequest;
import com.pctrade.pctrade_backend.dto.AiChatResponse;


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
    private final ListingRepository listingRepository;

    public CompatibilityResponse checkCompatibility(CompatibilityRequest request) {
        String prompt = "Check PC component compatibility for: " +
                String.join(", ", request.getComponents()) +
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

    public AiChatResponse chat(AiChatRequest request) {
        // Luam produsele disponibile din DB
        List<Listing> listings = listingRepository.findAll(
                com.pctrade.pctrade_backend.specification.ListingSpecification
                        .filterListings(null, null, null, null)
        );

        // Construim contextul cu produsele
        StringBuilder productsContext = new StringBuilder();
        productsContext.append("Produse disponibile pe ReSpec în acest moment:\n");
        for (Listing l : listings) {
            productsContext.append(String.format(
                    "- [ID:%d] %s | Categorie: %s | Pret: %s RON | Stare: %s%s%s\n",
                    l.getId(),
                    l.getTitle(),
                    l.getCategory(),
                    l.getPrice(),
                    l.getCondition(),
                    l.getBrand() != null ? " | Brand: " + l.getBrand() : "",
                    l.getLocation() != null ? " | Locatie: " + l.getLocation() : ""
            ));
        }

        // System prompt complet
        String systemPrompt = """
        Ești ReSpec AI, asistentul inteligent al platformei ReSpec — un marketplace românesc de componente PC și periferice second-hand.
        
        DESPRE RESPEC:
        - Platforma permite utilizatorilor să vândă și să cumpere componente PC second-hand
        - Categorii disponibile: CPU, GPU, RAM, SSD, HDD, Motherboard, PSU, Case, Cooling, Monitor, Laptop, Full PC, Peripheral, Other
        - Plățile sunt protejate prin sistem escrow — banii sunt blocați până când cumpărătorul confirmă primirea
        - Fluxul de tranzacție: PENDING → PAID → CONFIRMED_BY_SELLER → SHIPPED → COMPLETED
        - Utilizatorii pot lăsa recenzii după finalizarea tranzacției
        - Poți contacta vânzătorul prin sistemul de mesagerie și face oferte de preț
        
        POLITICA PLATFORMEI:
        - Comision 0% momentan (platformă în fază demo)
        - Orice utilizator poate vinde și cumpăra
        - Recenziile sunt permise doar după tranzacții finalizate
        - O singură recenzie per tranzacție
        
        CUM FUNCTIONEAZĂ:
        1. Creează cont sau loghează-te
        2. Caută componente în Browse sau folosește filtrele
        3. Contactează vânzătorul sau cumpără direct
        4. Plătește securizat prin escrow
        5. Confirmă primirea pentru a elibera banii
        
        """ + productsContext + """
        
        CAPABILITATI TALE:
        - Sugerezi componente disponibile pe site după buget și nevoi
        - Verifici compatibilitatea între componente
        - Propui setup-uri complete (gaming, office, workstation) din produsele disponibile
        - Găsești alternative similare pentru o componentă
        - Explici funcționalitățile platformei
        - Răspunzi la întrebări despre politica site-ului
        
        REGULI:
        - Răspunde MEREU în română
        - Fii concis și prietenos
        - Când sugerezi produse, menționează ID-ul și prețul
        - Dacă nu găsești produse potrivite în DB, spune că momentan nu sunt disponibile
        - Nu inventa produse care nu există în lista de mai sus
        - Folosește emoji-uri cu moderație pentru a face răspunsurile mai clare (✅ ❌ ⚠️ 💡 🖥️ etc.)
        """;

        // Construim lista de mesaje cu history
        List<Map<String, String>> messages = new java.util.ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Adaugam history-ul conversatiei
        if (request.getHistory() != null) {
            messages.addAll(request.getHistory());
        }

        // Adaugam mesajul curent
        messages.add(Map.of("role", "user", "content", request.getMessage()));

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "max_tokens", 1024
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

        AiChatResponse chatResponse = new AiChatResponse();
        chatResponse.setMessage(result);
        return chatResponse;
    }

    public AiChatResponse getSimilarSuggestions(String title, String category, String brand, String productModel, java.math.BigDecimal price, Long listingId) {
        // Luam produsele disponibile din DB
        List<Listing> listings = listingRepository.findAll(
                com.pctrade.pctrade_backend.specification.ListingSpecification
                        .filterListings(category, null, null, null)
        );

        StringBuilder productsContext = new StringBuilder();
        productsContext.append("Produse disponibile în categoria " + category + ":\n");
        for (Listing l : listings) {
            productsContext.append(String.format(
                    "- [ID:%d] %s | Pret: %s RON | Stare: %s%s%s\n",
                    l.getId(),
                    l.getTitle(),
                    l.getPrice(),
                    l.getCondition(),
                    l.getBrand() != null ? " | Brand: " + l.getBrand() : "",
                    l.getModel() != null ? " | Model: " + l.getModel() : ""
            ));
        }

        String prompt = String.format("""
    Utilizatorul se uită la acest produs (ID: %d):
    - Titlu: %s
    - Categorie: %s
    - Brand: %s
    - Model: %s
    - Preț: %s RON
    
    %s
    
    Sugerează maxim 3 produse similare din lista de mai sus.
    IMPORTANT: Nu include NICIODATĂ produsul cu ID-ul %d în sugestii.
    Criteriile de similaritate: același brand, model similar, preț apropiat sau categorie identică.
    
    Răspunde DOAR cu un JSON valid în acest format, fără text suplimentar:
    {
      "suggestions": [
        {"id": 1, "reason": "motivul scurt în română"}
      ]
    }
    """,
                listingId, title, category,
                brand != null ? brand : "necunoscut",
                productModel != null ? productModel : "necunoscut",
                price,
                productsContext,
                listingId
        );

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 512
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

        AiChatResponse aiResponse = new AiChatResponse();
        aiResponse.setMessage(result);
        return aiResponse;
    }
}