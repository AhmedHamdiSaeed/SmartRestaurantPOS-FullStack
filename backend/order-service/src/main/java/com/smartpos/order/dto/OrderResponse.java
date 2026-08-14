package com.smartpos.order.dto;

import com.smartpos.order.model.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String orderNumber;
    private OrderChannel channel;
    private OrderStatus status;
    private OrderPriority priority;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private Integer loyaltyPoints;
    private Integer tableNumber;
    private String deliveryAddress;
    private Double subtotal;
    private Double tax;
    private Double total;
    private Boolean isDelayed;
    private String delayReason;
    private String notes;
    private LocalDateTime estimatedReadyTime;
    private LocalDateTime actualReadyTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}
