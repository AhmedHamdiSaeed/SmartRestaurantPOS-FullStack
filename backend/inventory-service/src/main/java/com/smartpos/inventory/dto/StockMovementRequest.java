package com.smartpos.inventory.dto;

import com.smartpos.inventory.model.enums.StockMovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockMovementRequest {
    @NotBlank
    private String ingredientId;
    
    @NotNull
    private StockMovementType type;
    
    private double quantity;
    
    private String referenceId;
    
    private String referenceType;
    
    private String notes;
    
    private String performedBy;
}
