package com.smartpos.product.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String name; // e.g. "Small", "Medium", "Large", "Single", "Double"

    private String nameAr;
    private Double priceAdjustment; // e.g. +0.00, +5.00, +10.00
    private String sku;
    
    @Builder.Default
    private Boolean isAvailable = true;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
