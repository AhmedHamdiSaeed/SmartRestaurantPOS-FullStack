package com.smartpos.payment.service;

import com.smartpos.payment.dto.CreatePaymentRequest;
import com.smartpos.payment.dto.PaymentResponse;
import com.smartpos.payment.dto.RefundRequest;
import com.smartpos.payment.exception.DuplicatePaymentException;
import com.smartpos.payment.model.PaymentIntent;
import com.smartpos.payment.model.Refund;
import com.smartpos.payment.model.enums.PaymentMethod;
import com.smartpos.payment.model.enums.PaymentStatus;
import com.smartpos.payment.provider.PaymentProviderRegistry;
import com.smartpos.payment.provider.PaymentProviderResult;
import com.smartpos.payment.provider.adapter.CashPaymentAdapter;
import com.smartpos.payment.repository.PaymentIntentRepository;
import com.smartpos.payment.repository.RefundRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private PaymentProviderRegistry providerRegistry;

    @Mock
    private CashPaymentAdapter cashPaymentAdapter;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void createPayment_withCash_shouldSucceed() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
            .orderId("ORDER-123")
            .tenantId("TENANT-1")
            .amount(150.0)
            .method("CASH")
            .currency("SAR")
            .build();

        when(paymentIntentRepository.findByOrderId(any())).thenReturn(Optional.empty());
        when(providerRegistry.getProvider("CASH")).thenReturn(cashPaymentAdapter);
        
        PaymentProviderResult successResult = PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("EXT-123")
            .build();
            
        when(cashPaymentAdapter.process(any())).thenReturn(successResult);
        
        when(paymentIntentRepository.save(any(PaymentIntent.class))).thenAnswer(invocation -> {
            PaymentIntent intent = invocation.getArgument(0);
            if (intent.getId() == null) intent.setId(UUID.randomUUID().toString());
            return intent;
        });

        PaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals("ORDER-123", response.getOrderId());
        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertEquals("EXT-123", response.getExternalTransactionId());
    }

    @Test
    void createPayment_duplicateOrderId_shouldThrow() {
        CreatePaymentRequest request = CreatePaymentRequest.builder()
            .orderId("ORDER-123")
            .amount(150.0)
            .method("CASH")
            .build();

        when(paymentIntentRepository.findByOrderId("ORDER-123")).thenReturn(Optional.of(new PaymentIntent()));

        assertThrows(DuplicatePaymentException.class, () -> paymentService.createPayment(request));
    }

    @Test
    void processRefund_shouldCreateRefundRecord() {
        PaymentIntent intent = PaymentIntent.builder()
            .id("PAY-1")
            .orderId("ORDER-123")
            .amount(100.0)
            .status(PaymentStatus.COMPLETED)
            .method(PaymentMethod.CASH)
            .refunds(new ArrayList<>())
            .build();

        RefundRequest request = RefundRequest.builder()
            .amount(100.0)
            .reason("Customer complaint")
            .build();

        when(paymentIntentRepository.findById("PAY-1")).thenReturn(Optional.of(intent));
        when(providerRegistry.getProvider("CASH")).thenReturn(cashPaymentAdapter);
        
        PaymentProviderResult successResult = PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("REF-123")
            .build();
            
        when(cashPaymentAdapter.refund(any(), anyDouble())).thenReturn(successResult);
        when(refundRepository.save(any(Refund.class))).thenReturn(new Refund());
        
        when(paymentIntentRepository.save(any(PaymentIntent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.processRefund("PAY-1", request);

        assertNotNull(response);
        assertEquals(PaymentStatus.REFUNDED, response.getStatus());
        assertEquals(1, response.getRefunds().size());
        assertEquals(100.0, response.getRefunds().get(0).getAmount());
    }
}
