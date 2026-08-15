package com.smartpos.restaurant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "restaurants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Restaurant {
    @Id private String id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String code;
    private String timezone;
    @Column(nullable = false) private Instant createdAt;

    @PrePersist void initialize() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
    }
}
