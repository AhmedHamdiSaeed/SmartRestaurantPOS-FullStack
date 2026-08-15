package com.smartpos.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IngredientResponse {
    private String id;
    private String tenantId;
    private String name;
    private String nameAr;
    private String sku;
    private String unit;
    private double currentStock;
    private double minimumStock;
    private double costPerUnit;
    private String supplierId;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isLowStock;
}
