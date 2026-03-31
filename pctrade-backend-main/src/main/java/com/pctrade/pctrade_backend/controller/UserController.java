package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.dto.UserResponseDto;
import com.pctrade.pctrade_backend.model.User;
import com.pctrade.pctrade_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashMap;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // API-ul prin care vedem toți utilizatorii
    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        List<User> users = userRepository.findAll(); // Scoatem tot din baza de date

        // Transformăm fiecare entitate User într-un DTO sigur (fără parolă)
        return users.stream().map(user -> UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build()
        ).toList();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Userul nu a fost găsit!"));

        if (updates.containsKey("email")) {
            // Verificam daca email-ul e deja folosit de altcineva
            if (userRepository.existsByEmail(updates.get("email")) &&
                    !user.getEmail().equals(updates.get("email"))) {
                return ResponseEntity.status(400).body("Email-ul este deja folosit!");
            }
            user.setEmail(updates.get("email"));
        }

        if (updates.containsKey("username")) {
            if (userRepository.findByUsername(updates.get("username")).isPresent() &&
                    !user.getUsername().equals(updates.get("username"))) {
                return ResponseEntity.status(400).body("Username-ul este deja folosit!");
            }
            user.setUsername(updates.get("username"));
        }

        if (updates.containsKey("password") && !updates.get("password").isEmpty()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/public")
    public ResponseEntity<?> getPublicProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Userul nu a fost găsit!"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteAccount(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Userul nu a fost găsit!"));

        // Verificam parola curenta
        if (!passwordEncoder.matches(body.get("password"), user.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("message", "Parolă incorectă!"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Cont șters cu succes!"));
    }
}