package com.smartpos.order.model;

import com.smartpos.order.model.enums.*;
import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    private OrderChannel channel;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private OrderPriority priority;

    private String customerName;
    private String customerPhone;
    private String customerAddress;
    @Builder.Default
    private Integer loyaltyPoints = 0;

    private Integer tableNumber;
    private String deliveryAddress;

    private Double subtotal;
    private Double tax;
    private Double total;

    @Builder.Default
    private Boolean isDelayed = false;
    private String delayReason;
    private String notes;

    private LocalDateTime estimatedReadyTime;
    private LocalDateTime actualReadyTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
