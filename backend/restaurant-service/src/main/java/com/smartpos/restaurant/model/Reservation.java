package com.smartpos.restaurant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "table_reservations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {
    @Id
    private String id;

    @Column(nullable = false)
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_id")
    private RestaurantTable table;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    private String customerEmail;
    private Integer partySize;
    private LocalDateTime reservationTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    private String notes;
    private LocalDateTime createdAt;

    @PrePersist
    void initialize() {
        if (id == null) id = UUID.randomUUID().toString();
        if (status == null) status = ReservationStatus.CONFIRMED;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
