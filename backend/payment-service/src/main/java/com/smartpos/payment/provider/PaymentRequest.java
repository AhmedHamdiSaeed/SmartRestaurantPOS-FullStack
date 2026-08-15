package com.smartpos.payment.provider;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentRequest {
    private String referenceId;
    private double amount;
    private String currency;
    private String method;
    private String customerRef;
    private String description;
}
