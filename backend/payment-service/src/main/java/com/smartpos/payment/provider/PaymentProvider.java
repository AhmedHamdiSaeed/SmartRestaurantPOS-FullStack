package com.smartpos.payment.provider;

public interface PaymentProvider {
    String getName();
    PaymentProviderResult process(PaymentRequest request);
    PaymentProviderResult refund(String externalTransactionId, double amount);
    boolean supports(String paymentMethod);
}
