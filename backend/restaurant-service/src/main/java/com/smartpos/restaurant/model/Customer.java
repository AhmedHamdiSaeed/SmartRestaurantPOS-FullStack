package com.smartpos.restaurant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id
    private String id;

    private String tenantId;
    
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    private String email;
    
    @Builder.Default
    private Integer loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LoyaltyTier tier = LoyaltyTier.BRONZE;

    @Builder.Default
    private Double totalSpent = 0.0;

    @Builder.Default
    private Integer visitCount = 0;

    private LocalDateTime lastVisitAt;
    private LocalDateTime createdAt;

    @PrePersist
    void initialize() {
        if (id == null) id = UUID.randomUUID().toString();
        if (tier == null) tier = LoyaltyTier.BRONZE;
        if (loyaltyPoints == null) loyaltyPoints = 0;
        if (totalSpent == null) totalSpent = 0.0;
        if (visitCount == null) visitCount = 0;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
