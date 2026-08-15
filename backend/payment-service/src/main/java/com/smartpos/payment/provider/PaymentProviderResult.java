package com.smartpos.payment.provider;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentProviderResult {
    private boolean success;
    private String externalTransactionId;
    private String failureReason;
    private String providerName;
}
