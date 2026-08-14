package com.smartpos.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private String id;
    private String name;
    private Integer quantity;
    private Double price;
    private String notes;
    private String allergens;
    private String category;
}
