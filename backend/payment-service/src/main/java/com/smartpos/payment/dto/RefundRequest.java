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
public class RefundRequest {
    @Positive(message = "Amount must be positive")
    private double amount;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private String processedBy;
}
