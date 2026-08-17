package com.smartpos.payment.controller;

import com.smartpos.payment.dto.CreatePaymentRequest;
import com.smartpos.payment.dto.PaymentResponse;
import com.smartpos.payment.dto.RefundRequest;
import com.smartpos.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {
    
    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new payment")
    public PaymentResponse createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public PaymentResponse getPaymentById(@PathVariable String id) {
        return paymentService.getPaymentById(id);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment by Order ID")
    public PaymentResponse getPaymentByOrderId(@PathVariable String orderId) {
        return paymentService.getPaymentByOrderId(orderId);
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Process a refund")
    public PaymentResponse processRefund(@PathVariable String id, @Valid @RequestBody RefundRequest request) {
        return paymentService.processRefund(id, request);
    }
}
