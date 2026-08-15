package com.smartpos.payment.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Refund {

    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intent_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PaymentIntent intent;
    
    @Column(nullable = false)
    private double amount;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "processed_by")
    private String processedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
