package com.pctrade.pctrade_backend.specification;

import com.pctrade.pctrade_backend.model.Listing;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ListingSpecification {

    /**
     * Construiește o interogare dinamică bazată pe filtrele primite.
     * Include automat condiția ca produsul să fie disponibil.
     */
    public static Specification<Listing> filterListings(
            String category,
            String condition,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. FILTRUL OBLIGATORIU: Afișăm doar produsele care nu au fost încă vândute
            // Aceasta corespunde coloanei isAvailable = true
            predicates.add(criteriaBuilder.isTrue(root.get("isAvailable")));

            // 2. Filtru după Categorie (dacă este trimis)
            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // 3. Filtru după Stare (New/Used - dacă este trimis)
            if (condition != null && !condition.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("condition"), condition));
            }

            // 4. Filtru Preț Minim
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            // 5. Filtru Preț Maxim
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Combinăm toate condițiile cu operatorul logic AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}