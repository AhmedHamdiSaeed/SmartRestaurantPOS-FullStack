package com.smartpos.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PurchaseOrder order;

    private String ingredientId;

    private String ingredientName;

    private double quantity;

    private double unitCost;

    private double totalCost;

}
