package com.smartpos.inventory.model;

import com.smartpos.inventory.model.enums.StockMovementType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    private String id;

    private String tenantId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Enumerated(EnumType.STRING)
    private StockMovementType type;

    private double quantity;

    private double quantityBefore;

    private double quantityAfter;

    private String referenceId;

    private String referenceType;

    private String notes;

    private String performedBy;

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
