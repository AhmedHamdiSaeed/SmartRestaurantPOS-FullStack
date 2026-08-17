package com.smartpos.order.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    private String id;

    private String name;
    private Integer quantity;
    private Double price;
    private String notes;
    private String allergens;
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    @ToString.Exclude
    private Order order;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
