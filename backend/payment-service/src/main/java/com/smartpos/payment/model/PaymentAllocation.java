package com.smartpos.payment.model;

import com.smartpos.payment.model.enums.PaymentMethod;
import com.smartpos.payment.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_allocations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAllocation {

    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intent_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PaymentIntent intent;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;
    
    @Column(nullable = false)
    private double amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column(name = "external_transaction_id")
    private String externalTransactionId;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
