package com.smartpos.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecipeItemRequest {
    @NotBlank
    private String ingredientId;
    
    private double quantity;
    
    private String unit;
}
