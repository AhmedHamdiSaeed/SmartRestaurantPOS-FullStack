package com.smartpos.payment.dto;

import com.smartpos.payment.model.enums.PaymentMethod;
import com.smartpos.payment.model.enums.PaymentStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private String id;
    private String orderId;
    private String tenantId;
    private double amount;
    private double tipAmount;
    private PaymentStatus status;
    private PaymentMethod method;
    private String currency;
    private String referenceNumber;
    private String externalTransactionId;
    private String failureReason;
    private List<AllocationResponse> allocations;
    private List<RefundResponse> refunds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class AllocationResponse {
        private String id;
        private PaymentMethod method;
        private double amount;
        private PaymentStatus status;
        private String externalTransactionId;
        private String notes;
        private LocalDateTime processedAt;
    }

    @Data
    @Builder
    public static class RefundResponse {
        private String id;
        private double amount;
        private String reason;
        private String processedBy;
        private LocalDateTime createdAt;
    }
}
