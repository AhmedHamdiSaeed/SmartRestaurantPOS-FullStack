package com.smartpos.inventory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LowStockAlert {
    private String ingredientId;
    private String name;
    private double currentStock;
    private double minimumStock;
    private String unit;
    private String supplierId;
}
