package com.smartpos.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RecipeRequest {
    @NotBlank
    private String productId;
    
    private String productName;
    
    private List<RecipeItemRequest> items;
}
