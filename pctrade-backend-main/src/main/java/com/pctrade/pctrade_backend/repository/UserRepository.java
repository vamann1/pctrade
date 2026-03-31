package com.pctrade.pctrade_backend.repository;

import com.pctrade.pctrade_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Metodă utilă pentru login: căutăm user-ul după nume
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Verificăm dacă un email este deja înregistrat
    Boolean existsByEmail(String email);
}