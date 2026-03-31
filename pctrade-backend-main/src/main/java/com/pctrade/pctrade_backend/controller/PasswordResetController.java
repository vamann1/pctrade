package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.model.PasswordResetToken;
import com.pctrade.pctrade_backend.model.User;
import com.pctrade.pctrade_backend.repository.PasswordResetTokenRepository;
import com.pctrade.pctrade_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nu există niciun cont asociat acestui email."));
        }

        tokenRepository.deleteByUserId(user.getId());

        String code = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken token = PasswordResetToken.builder()
                .token(code)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        tokenRepository.save(token);

        // Demo — returnam codul direct in response
        return ResponseEntity.ok(Map.of(
                "message", "Cod generat cu succes!",
                "code", code
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String newPassword = body.get("newPassword");

        PasswordResetToken token = tokenRepository.findByToken(code).orElse(null);

        if (token == null || token.isUsed()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cod invalid!"));
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Codul a expirat! Solicită unul nou."));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parola trebuie să aibă cel puțin 6 caractere."));
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        return ResponseEntity.ok(Map.of("message", "Parolă schimbată cu succes!"));
    }
}