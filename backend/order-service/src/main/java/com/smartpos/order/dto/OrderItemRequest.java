package com.smartpos.order.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class OrderItemRequest {
    @NotBlank
    private String name;
    @NotNull
    private Integer quantity;
    @NotNull
    private Double price;
    private String notes;
    private String allergens;
    private String category;
}
