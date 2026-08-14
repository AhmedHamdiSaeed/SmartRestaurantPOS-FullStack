package com.smartpos.product.model;

import com.smartpos.product.model.enums.ProductCategory;
import lombok.*;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    private String id;

    private String name;
    private String nameAr;

    @Column(unique = true, nullable = false)
    private String sku;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    private Double price;

    @Column(length = 500)
    private String description;
    private String imageUrl;

    private String allergens;
    private Integer calories;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private Boolean isPopular = false;

    private Integer preparationTime;
    private String tags;
    private Double rating;

    @Builder.Default
    private Integer salesCount = 0;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
