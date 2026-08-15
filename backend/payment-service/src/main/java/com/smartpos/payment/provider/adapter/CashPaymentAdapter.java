package com.smartpos.payment.provider.adapter;

import com.smartpos.payment.provider.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CashPaymentAdapter implements PaymentProvider {
    
    @Override 
    public String getName() { 
        return "CASH"; 
    }
    
    @Override 
    public boolean supports(String method) { 
        return "CASH".equalsIgnoreCase(method); 
    }
    
    @Override
    public PaymentProviderResult process(PaymentRequest request) {
        return PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("CASH-" + UUID.randomUUID().toString().substring(0,8).toUpperCase())
            .providerName("CASH")
            .build();
    }
    
    @Override
    public PaymentProviderResult refund(String externalTransactionId, double amount) {
        return PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("REFUND-" + externalTransactionId)
            .providerName("CASH")
            .build();
    }
}
