package com.smartpos.restaurant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "restaurant_branches", uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "code"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Branch {
    @Id private String id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "restaurant_id") private Restaurant restaurant;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String code;
    private String address;
    private String timezone;
    @Column(nullable = false) private Instant createdAt;

    @PrePersist void initialize() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
    }
}
