package com.smartpos.payment.service;

import com.smartpos.payment.dto.*;
import com.smartpos.payment.exception.DuplicatePaymentException;
import com.smartpos.payment.exception.PaymentNotFoundException;
import com.smartpos.payment.model.PaymentAllocation;
import com.smartpos.payment.model.PaymentIntent;
import com.smartpos.payment.model.Refund;
import com.smartpos.payment.model.enums.PaymentMethod;
import com.smartpos.payment.model.enums.PaymentStatus;
import com.smartpos.payment.provider.PaymentProvider;
import com.smartpos.payment.provider.PaymentProviderRegistry;
import com.smartpos.payment.provider.PaymentProviderResult;
import com.smartpos.payment.provider.PaymentRequest;
import com.smartpos.payment.repository.PaymentIntentRepository;
import com.smartpos.payment.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentIntentRepository paymentIntentRepository;
    private final RefundRepository refundRepository;
    private final PaymentProviderRegistry providerRegistry;

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        log.info("Creating payment for order {}", request.getOrderId());
        
        paymentIntentRepository.findByOrderId(request.getOrderId())
            .ifPresent(p -> {
                throw new DuplicatePaymentException("Payment already exists for order ID: " + request.getOrderId());
            });

        PaymentIntent intent = PaymentIntent.builder()
            .orderId(request.getOrderId())
            .tenantId(request.getTenantId())
            .amount(request.getAmount())
            .method(PaymentMethod.valueOf(request.getMethod().toUpperCase()))
            .currency(request.getCurrency())
            .build();

        if (intent.getMethod() == PaymentMethod.SPLIT) {
            if (request.getAllocations() == null || request.getAllocations().isEmpty()) {
                throw new IllegalArgumentException("Allocations required for SPLIT payment");
            }
            double totalAllocated = request.getAllocations().stream().mapToDouble(AllocationRequest::getAmount).sum();
            if (Math.abs(totalAllocated - intent.getAmount()) > 0.01) {
                throw new IllegalArgumentException("Allocated amount does not match total amount");
            }
            
            for (AllocationRequest alloc : request.getAllocations()) {
                PaymentAllocation allocation = PaymentAllocation.builder()
                    .id(UUID.randomUUID().toString())
                    .intent(intent)
                    .method(PaymentMethod.valueOf(alloc.getMethod().toUpperCase()))
                    .amount(alloc.getAmount())
                    .status(PaymentStatus.PROCESSING)
                    .build();
                intent.getAllocations().add(allocation);
            }
        }
        
        intent = paymentIntentRepository.save(intent);

        if (intent.getMethod() == PaymentMethod.SPLIT) {
            boolean allSuccess = true;
            for (PaymentAllocation alloc : intent.getAllocations()) {
                PaymentProvider provider = providerRegistry.getProvider(alloc.getMethod().name());
                PaymentProviderResult result = provider.process(
                    PaymentRequest.builder()
                        .referenceId(intent.getReferenceNumber() + "-" + alloc.getId())
                        .amount(alloc.getAmount())
                        .currency(intent.getCurrency())
                        .method(alloc.getMethod().name())
                        .build()
                );
                if (result.isSuccess()) {
                    alloc.setStatus(PaymentStatus.COMPLETED);
                    alloc.setExternalTransactionId(result.getExternalTransactionId());
                    alloc.setProcessedAt(LocalDateTime.now());
                } else {
                    alloc.setStatus(PaymentStatus.FAILED);
                    alloc.setNotes(result.getFailureReason());
                    allSuccess = false;
                }
            }
            intent.setStatus(allSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
        } else {
            PaymentProvider provider = providerRegistry.getProvider(intent.getMethod().name());
            PaymentProviderResult result = provider.process(
                PaymentRequest.builder()
                    .referenceId(intent.getReferenceNumber())
                    .amount(intent.getAmount())
                    .currency(intent.getCurrency())
                    .method(intent.getMethod().name())
                    .customerRef(request.getCustomerRef())
                    .build()
            );

            if (result.isSuccess()) {
                intent.setStatus(PaymentStatus.COMPLETED);
                intent.setExternalTransactionId(result.getExternalTransactionId());
            } else {
                intent.setStatus(PaymentStatus.FAILED);
                intent.setFailureReason(result.getFailureReason());
            }
        }

        return mapToResponse(paymentIntentRepository.save(intent));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(String orderId) {
        return paymentIntentRepository.findByOrderId(orderId)
            .map(this::mapToResponse)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found for order: " + orderId));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(String id) {
        return paymentIntentRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));
    }

    @Transactional
    public PaymentResponse processRefund(String paymentId, RefundRequest request) {
        PaymentIntent intent = paymentIntentRepository.findById(paymentId)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));
            
        if (intent.getStatus() != PaymentStatus.COMPLETED && intent.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new IllegalStateException("Only COMPLETED or PARTIALLY_REFUNDED payments can be refunded");
        }

        double refundedTotal = intent.getRefunds().stream().mapToDouble(Refund::getAmount).sum();
        if (refundedTotal + request.getAmount() > intent.getAmount()) {
            throw new IllegalArgumentException("Refund amount exceeds total paid amount");
        }

        PaymentProvider provider = providerRegistry.getProvider(intent.getMethod() == PaymentMethod.SPLIT ? "CASH" : intent.getMethod().name());
        PaymentProviderResult result = provider.refund(intent.getExternalTransactionId(), request.getAmount());

        if (result.isSuccess()) {
            Refund refund = Refund.builder()
                .id(UUID.randomUUID().toString())
                .intent(intent)
                .amount(request.getAmount())
                .reason(request.getReason())
                .processedBy(request.getProcessedBy())
                .createdAt(LocalDateTime.now())
                .build();
                
            intent.getRefunds().add(refund);
            refundRepository.save(refund);

            if (refundedTotal + request.getAmount() == intent.getAmount()) {
                intent.setStatus(PaymentStatus.REFUNDED);
            } else {
                intent.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }
            
            return mapToResponse(paymentIntentRepository.save(intent));
        } else {
            throw new RuntimeException("Refund failed: " + result.getFailureReason());
        }
    }

    public PaymentResponse mapToResponse(PaymentIntent intent) {
        return PaymentResponse.builder()
            .id(intent.getId())
            .orderId(intent.getOrderId())
            .tenantId(intent.getTenantId())
            .amount(intent.getAmount())
            .tipAmount(intent.getTipAmount())
            .status(intent.getStatus())
            .method(intent.getMethod())
            .currency(intent.getCurrency())
            .referenceNumber(intent.getReferenceNumber())
            .externalTransactionId(intent.getExternalTransactionId())
            .failureReason(intent.getFailureReason())
            .createdAt(intent.getCreatedAt())
            .updatedAt(intent.getUpdatedAt())
            .allocations(intent.getAllocations().stream().map(a -> PaymentResponse.AllocationResponse.builder()
                .id(a.getId())
                .method(a.getMethod())
                .amount(a.getAmount())
                .status(a.getStatus())
                .externalTransactionId(a.getExternalTransactionId())
                .notes(a.getNotes())
                .processedAt(a.getProcessedAt())
                .build()).collect(Collectors.toList()))
            .refunds(intent.getRefunds().stream().map(r -> PaymentResponse.RefundResponse.builder()
                .id(r.getId())
                .amount(r.getAmount())
                .reason(r.getReason())
                .processedBy(r.getProcessedBy())
                .createdAt(r.getCreatedAt())
                .build()).collect(Collectors.toList()))
            .build();
    }
}
