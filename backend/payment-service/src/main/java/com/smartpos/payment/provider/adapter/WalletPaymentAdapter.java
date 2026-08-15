package com.smartpos.payment.provider.adapter;

import com.smartpos.payment.provider.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class WalletPaymentAdapter implements PaymentProvider {
    
    @Override 
    public String getName() { 
        return "WALLET"; 
    }
    
    @Override 
    public boolean supports(String method) { 
        return "WALLET".equalsIgnoreCase(method); 
    }
    
    @Override
    public PaymentProviderResult process(PaymentRequest request) {
        return PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("WALLET-" + UUID.randomUUID().toString().substring(0,8).toUpperCase())
            .providerName("WALLET")
            .build();
    }
    
    @Override
    public PaymentProviderResult refund(String externalTransactionId, double amount) {
        return PaymentProviderResult.builder()
            .success(true)
            .externalTransactionId("REFUND-" + externalTransactionId)
            .providerName("WALLET")
            .build();
    }
}
