package com.smartpos.product.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "product_modifiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductModifier {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String name; // e.g. "Extra Cheese", "No Onions", "Gluten-Free Bun"

    private String nameAr;
    private String groupName; // e.g. "Toppings", "Sauces", "Dietary"
    private Double price;
    
    @Builder.Default
    private Boolean isAvailable = true;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
