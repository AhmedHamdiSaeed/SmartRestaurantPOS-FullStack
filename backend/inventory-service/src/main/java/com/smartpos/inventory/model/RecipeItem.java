package com.smartpos.inventory.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_items")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeItem {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    private double quantity;
    
    private String unit;
}
