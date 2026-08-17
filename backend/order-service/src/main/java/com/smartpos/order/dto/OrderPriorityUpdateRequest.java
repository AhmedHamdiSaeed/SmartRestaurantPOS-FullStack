package com.smartpos.order.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class OrderPriorityUpdateRequest {
    @NotBlank
    private String priority;
}
