package com.smartpos.kitchen.model;

import com.smartpos.kitchen.model.enums.*;
import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "kitchen_stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitchenStation {
    @Id
    private String id;

    private String name;

    @Enumerated(EnumType.STRING)
    private StationType type;

    private Integer currentLoad;
    private Integer maxCapacity;
    private Integer activeOrders;
    private Double avgPrepTime;

    @Enumerated(EnumType.STRING)
    private StationStatus status;

    private LocalDateTime lastUpdated;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
