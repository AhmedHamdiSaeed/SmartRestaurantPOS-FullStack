package com.smartpos.order.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class OrderStatusUpdateRequest {
    @NotBlank
    private String status;
    private String reason;
}
