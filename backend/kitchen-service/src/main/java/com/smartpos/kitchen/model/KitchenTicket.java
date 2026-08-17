package com.smartpos.kitchen.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "kitchen_tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicket {

    @Id
    private String id;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String orderNumber;

    private String tenantId;
    private String tableNumber;
    private String channel; // WALKIN, DELIVERY, TAKEAWAY
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<KitchenTicketItem> items = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (status == null) status = TicketStatus.NEW;
    }
}
