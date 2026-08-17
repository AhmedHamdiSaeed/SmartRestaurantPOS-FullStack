package com.smartpos.restaurant.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "restaurant_tables", uniqueConstraints = @UniqueConstraint(columnNames = {"branch_id", "table_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RestaurantTable {
    @Id private String id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "branch_id") private Branch branch;
    @Column(name = "table_number", nullable = false) private String tableNumber;
    private String floorName;
    private String sectionName;
    private Integer capacity;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TableStatus status;
    @Column(nullable = false) private Instant createdAt;

    @PrePersist void initialize() {
        if (id == null) id = UUID.randomUUID().toString();
        if (status == null) status = TableStatus.AVAILABLE;
        if (createdAt == null) createdAt = Instant.now();
    }
}
