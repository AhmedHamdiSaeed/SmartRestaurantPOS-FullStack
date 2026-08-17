package com.smartpos.order.event;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderStatusChangedEvent {
    private String orderId;
    private String orderNumber;
    private String tenantId;
    private String previousStatus;
    private String newStatus;
    private LocalDateTime changedAt;
}
