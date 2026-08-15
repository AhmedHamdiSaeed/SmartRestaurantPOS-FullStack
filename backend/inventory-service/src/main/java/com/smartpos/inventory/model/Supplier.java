package com.smartpos.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "suppliers")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    private String id;

    private String tenantId;

    private String name;

    private String contactName;

    private String contactEmail;

    private String contactPhone;

    private String address;

    @Builder.Default
    private double rating = 5.0;

    @Builder.Default
    private boolean active = true;

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
