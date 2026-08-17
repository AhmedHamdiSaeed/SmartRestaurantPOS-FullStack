package com.smartpos.kitchen.event;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderCreatedEvent {
    private String orderId;
    private String orderNumber;
    private String tenantId;
    private String channel;
    private String tableNumber;
    private String customerName;
    private List<OrderItemEvent> items;
    private double total;
    private LocalDateTime createdAt;

    @Data
    public static class OrderItemEvent {
        private String name;
        private int quantity;
        private String category;
        private String notes;
    }
}
