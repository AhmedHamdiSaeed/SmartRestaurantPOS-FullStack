package com.smartpos.order.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class OrderPriorityUpdateRequest {
    @NotBlank
    private String priority;
}
