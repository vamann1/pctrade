package com.pctrade.pctrade_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data // Adaugă automat Getteri, Setteri, toString etc.
@Builder // Ne ajută să construim obiecte ușor
@NoArgsConstructor // Constructor fără argumente (obligatoriu pt JPA)
@AllArgsConstructor // Constructor cu toate argumentele
@Entity // Îi spune lui Spring că asta e o tabelă în baza de date
@Table(name = "users") // Denumim tabela "users" (deoarece "user" e cuvânt rezervat în Postgres)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Această metodă se rulează automat înainte ca un user să fie salvat în DB
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}