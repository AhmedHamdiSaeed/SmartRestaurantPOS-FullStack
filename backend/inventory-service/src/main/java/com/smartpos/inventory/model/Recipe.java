package com.smartpos.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "recipes")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    private String id;

    private String tenantId;

    private String productId;

    private String productName;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @Builder.Default
    private List<RecipeItem> items = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
