package com.smartpos.payment.provider.adapter;

import com.smartpos.payment.provider.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CardPaymentAdapter implements PaymentProvider {
    
    @Override 
    public String getName() { 
        return "CARD"; 
    }
    
    @Override 
    public boolean supports(String method) { 
        return "CARD".equalsIgnoreCase(method); 
    }
    
    @Override
    public PaymentProviderResult process(PaymentRequest request) {
        boolean success = Math.random() > 0.05;
        
        if (success) {
            return PaymentProviderResult.builder()
                .success(true)
                .externalTransactionId("CARD-" + UUID.randomUUID().toString().substring(0,8).toUpperCase())
                .providerName("CARD")
                .build();
        } else {
            return PaymentProviderResult.builder()
                .success(false)
                .failureReason("Declined by issuer")
                .providerName("CARD")
                .build();
        }
    }
    
    @Override
    public PaymentProviderResult refund(String externalTransactionId, double amount) {
        return PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("REFUND-" + externalTransactionId)
            .providerName("CARD")
            .build();
    }
}
