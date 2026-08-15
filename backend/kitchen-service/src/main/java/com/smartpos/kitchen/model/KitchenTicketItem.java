package com.smartpos.kitchen.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "kitchen_ticket_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicketItem {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private KitchenTicket ticket;

    @Column(nullable = false)
    private String name;

    private int quantity;
    private String category;
    private String notes;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
