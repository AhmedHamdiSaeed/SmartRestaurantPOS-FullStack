package com.smartpos.inventory.event;

import lombok.Data;
import java.util.List;

@Data
public class OrderPaidEvent {
    private String orderId;
    private String tenantId;
    private List<OrderItemInfo> items;
    
    @Data
    public static class OrderItemInfo {
        private String productId;
        private String productName;
        private int quantity;
    }
}
