package com.smartpos.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ingredients")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    
    @Id
    private String id;
    
    private String tenantId;
    
    private String name;
    
    private String nameAr;
    
    private String sku;
    
    private String unit;
    
    @Builder.Default
    private double currentStock = 0;
    
    @Builder.Default
    private double minimumStock = 0;
    
    private double costPerUnit;
    
    private String supplierId;
    
    @Builder.Default
    private boolean active = true;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        active = true;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
