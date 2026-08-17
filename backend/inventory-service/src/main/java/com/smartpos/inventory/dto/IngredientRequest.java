package com.smartpos.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class IngredientRequest {
    
    @NotBlank
    private String name;
    
    private String nameAr;
    
    private String sku;
    
    @NotBlank
    private String unit;
    
    @PositiveOrZero
    private double currentStock;
    
    @PositiveOrZero
    private double minimumStock;
    
    @PositiveOrZero
    private double costPerUnit;
    
    private String supplierId;
}
