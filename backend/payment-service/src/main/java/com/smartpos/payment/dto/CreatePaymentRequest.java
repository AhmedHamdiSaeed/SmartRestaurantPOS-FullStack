package com.smartpos.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentRequest {
    @NotBlank(message = "OrderId is required")
    private String orderId;
    
    @NotBlank(message = "TenantId is required")
    private String tenantId;
    
    @Positive(message = "Amount must be positive")
    private double amount;
    
    @NotBlank(message = "Method is required (CASH, CARD, WALLET, SPLIT)")
    private String method;
    
    @Builder.Default
    private String currency = "SAR";
    
    private String customerRef;
    
    private List<AllocationRequest> allocations;
}
