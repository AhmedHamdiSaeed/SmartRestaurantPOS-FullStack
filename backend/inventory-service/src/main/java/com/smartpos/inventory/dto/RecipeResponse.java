package com.smartpos.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RecipeResponse {
    private String id;
    private String productId;
    private String productName;
    private List<RecipeItemResponse> items;
    private boolean active;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class RecipeItemResponse {
        private String ingredientId;
        private String ingredientName;
        private double quantity;
        private String unit;
    }
}
