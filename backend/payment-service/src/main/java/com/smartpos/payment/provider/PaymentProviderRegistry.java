package com.smartpos.payment.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PaymentProviderRegistry {
    private final List<PaymentProvider> providers;
    
    public PaymentProvider getProvider(String method) {
        return providers.stream()
            .filter(p -> p.supports(method))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("No payment provider for method: " + method));
    }
}
