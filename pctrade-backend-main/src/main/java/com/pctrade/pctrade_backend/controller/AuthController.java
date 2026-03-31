package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.model.RegisterRequest;
import com.pctrade.pctrade_backend.model.LoginRequest;
import com.pctrade.pctrade_backend.model.Role;
import com.pctrade.pctrade_backend.model.User;
import com.pctrade.pctrade_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        // 1. Verificăm dacă user-ul există deja
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Error: Username is already taken!";
        }
        // 2. Verificam daca adresa de mail este deja folosita
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Acest email este deja folosit de altcineva!");
        }

        // 3. Creăm entitatea User și criptăm parola
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Criptare BCrypt
                .role(Role.USER)
                .build();

        // 3. Salvăm în baza de date
        userRepository.save(user);

        return "User registered successfully!";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // 1. Gasim userul dupa username
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Username sau parolă incorectă!");
        }

        User user = userOptional.get();

        // 2. Verificam parola
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Username sau parolă incorectă!");
        }

        // 3. Returnam datele userului (fara JWT momentan)
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        response.put("user", userData);
        response.put("token", "temp-token-" + user.getId());
        userData.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }
}