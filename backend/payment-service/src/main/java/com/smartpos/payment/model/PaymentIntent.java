package com.smartpos.payment.model;

import com.smartpos.payment.model.enums.PaymentMethod;
import com.smartpos.payment.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "payment_intents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntent {
    
    @Id
    private String id;
    
    @Column(name = "order_id", nullable = false)
    private String orderId;
    
    @Column(name = "tenant_id")
    private String tenantId;
    
    @Column(nullable = false)
    private double amount;
    
    @Column(name = "tip_amount", nullable = false)
    @Builder.Default
    private double tipAmount = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;
    
    @Column(nullable = false)
    @Builder.Default
    private String currency = "SAR";
    
    @Column(name = "reference_number", unique = true, nullable = false)
    private String referenceNumber;
    
    @Column(name = "external_transaction_id")
    private String externalTransactionId;
    
    @Column(name = "failure_reason")
    private String failureReason;
    
    @OneToMany(mappedBy = "intent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentAllocation> allocations = new ArrayList<>();
    
    @OneToMany(mappedBy = "intent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Refund> refunds = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (referenceNumber == null) {
            referenceNumber = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = PaymentStatus.PENDING;
        }
        if (currency == null) {
            currency = "SAR";
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
