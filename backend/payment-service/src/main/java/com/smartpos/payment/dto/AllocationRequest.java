package com.smartpos.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationRequest {
    @NotBlank(message = "Method is required")
    private String method;
    
    @Positive(message = "Amount must be positive")
    private double amount;
}
