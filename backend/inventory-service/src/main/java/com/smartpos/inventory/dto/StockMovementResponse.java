package com.smartpos.inventory.dto;

import com.smartpos.inventory.model.enums.StockMovementType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StockMovementResponse {
    private String id;
    private String tenantId;
    private String ingredientId;
    private StockMovementType type;
    private double quantity;
    private double quantityBefore;
    private double quantityAfter;
    private String referenceId;
    private String referenceType;
    private String notes;
    private String performedBy;
    private LocalDateTime createdAt;
}
