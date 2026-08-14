package com.smartpos.order.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

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
